import { Hono } from "hono";
import { db } from "@/db";
import { cart, cartItem } from "@/db/schema/cart-schema";
import { product } from "@/db/schema/product-schema";
import { eq, and } from "drizzle-orm";

const cartRoutes = new Hono();

function getCartOwner(c: any): { userId?: string; sessionToken?: string } {
  const user = c.get("user");
  const sessionToken = c.req.header("X-Session-Token");
  return {
    userId: user?.id,
    sessionToken: user ? undefined : sessionToken || undefined,
  };
}

async function findOrCreateCart(owner: {
  userId?: string;
  sessionToken?: string;
}) {
  if (!owner.userId && !owner.sessionToken) return null;

  const existing = await db.query.cart.findFirst({
    where: owner.userId
      ? eq(cart.userId, owner.userId)
      : eq(cart.sessionToken, owner.sessionToken!),
    with: {
      items: true,
    },
  });

  if (existing) return existing;

  const id = crypto.randomUUID();
  await db.insert(cart).values({
    id,
    userId: owner.userId || null,
    sessionToken: owner.sessionToken || null,
  });

  return {
    id,
    userId: owner.userId,
    sessionToken: owner.sessionToken,
    items: [],
  };
}

async function hydrateCartItems(items: any[]) {
  if (items.length === 0) return [];
  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await db.query.product.findMany({
    where: (p, { inArray }) => inArray(p.id, productIds),
    columns: { id: true, name: true, images: true, price: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  return items.map((item) => {
    const prod = productMap.get(item.productId);
    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId || null,
      quantity: item.quantity,
      priceCents: item.priceCents,
      title: prod?.name || "Unknown",
      image: prod?.images?.[0] || null,
    };
  });
}

cartRoutes.get("/", async (c) => {
  try {
    const owner = getCartOwner(c);
    const userCart = await findOrCreateCart(owner);
    if (!userCart) return c.json({ cart: null, items: [] });

    const items = await hydrateCartItems(userCart.items);
    return c.json({ cart: { id: userCart.id }, items });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return c.json({ error: "Failed to fetch cart" }, 500);
  }
});

cartRoutes.post("/add", async (c) => {
  try {
    const owner = getCartOwner(c);
    const userCart = await findOrCreateCart(owner);
    if (!userCart)
      return c.json({ error: "Could not identify cart owner" }, 400);

    const body = await c.req.json();
    if (!body.productId) return c.json({ error: "productId required" }, 400);

    const prod = await db.query.product.findFirst({
      where: eq(product.id, body.productId),
      columns: { id: true, price: true },
    });
    if (!prod) return c.json({ error: "Product not found" }, 404);

    const priceCents =
      body.priceCents ?? Math.round(parseFloat(prod.price) * 100);
    let variantPrice: number | null = null;

    if (body.variantId) {
      const [v] = await db
        .select({ price: product.price })
        .from(product)
        .where(eq(product.id, body.productId));
      if (v?.price) variantPrice = Math.round(parseFloat(v.price) * 100);
    }

    const finalPrice = variantPrice || priceCents;

    const existing = userCart.items.find(
      (i: any) =>
        i.productId === body.productId &&
        (i.variantId || null) === (body.variantId || null),
    );

    if (existing) {
      await db
        .update(cartItem)
        .set({ quantity: existing.quantity + (body.quantity || 1) })
        .where(eq(cartItem.id, existing.id));
    } else {
      await db.insert(cartItem).values({
        id: crypto.randomUUID(),
        cartId: userCart.id,
        productId: body.productId,
        variantId: body.variantId || null,
        quantity: body.quantity || 1,
        priceCents: finalPrice,
      });
    }

    return c.json({ message: "Item added to cart" }, 201);
  } catch (error) {
    console.error("Error adding to cart:", error);
    return c.json({ error: "Failed to add item" }, 500);
  }
});

cartRoutes.put("/item/:itemId", async (c) => {
  try {
    const itemId = c.req.param("itemId");
    const body = await c.req.json();

    if (body.quantity < 1) {
      await db.delete(cartItem).where(eq(cartItem.id, itemId));
      return c.json({ message: "Item removed" });
    }

    await db
      .update(cartItem)
      .set({ quantity: body.quantity })
      .where(eq(cartItem.id, itemId));

    return c.json({ message: "Quantity updated" });
  } catch (error) {
    console.error("Error updating cart item:", error);
    return c.json({ error: "Failed to update item" }, 500);
  }
});

cartRoutes.delete("/item/:itemId", async (c) => {
  try {
    const itemId = c.req.param("itemId");
    await db.delete(cartItem).where(eq(cartItem.id, itemId));
    return c.json({ message: "Item removed" });
  } catch (error) {
    console.error("Error removing item:", error);
    return c.json({ error: "Failed to remove item" }, 500);
  }
});

cartRoutes.delete("/clear", async (c) => {
  try {
    const owner = getCartOwner(c);
    const userCart = await findOrCreateCart(owner);
    if (userCart) {
      await db.delete(cartItem).where(eq(cartItem.cartId, userCart.id));
    }
    return c.json({ message: "Cart cleared" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return c.json({ error: "Failed to clear cart" }, 500);
  }
});

cartRoutes.post("/merge", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json(
        {
          error: "Session expired. Please log in again.",
          code: "SESSION_EXPIRED",
        },
        401,
      );
    }

    const body = await c.req.json();
    const sessionToken = body.sessionToken;
    if (!sessionToken) return c.json({ error: "sessionToken required" }, 400);

    const guestCart = await db.query.cart.findFirst({
      where: eq(cart.sessionToken, sessionToken),
      with: { items: true },
    });

    const userCart = await db.query.cart.findFirst({
      where: eq(cart.userId, user.id),
      with: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) {
      if (userCart)
        await db
          .update(cart)
          .set({ sessionToken: null })
          .where(eq(cart.id, userCart.id));
      return c.json({ message: "Nothing to merge" });
    }

    if (userCart) {
      for (const guestItem of guestCart.items) {
        const match = userCart.items.find(
          (i) =>
            i.productId === guestItem.productId &&
            (i.variantId || null) === (guestItem.variantId || null),
        );
        if (match) {
          await db
            .update(cartItem)
            .set({ quantity: match.quantity + guestItem.quantity })
            .where(eq(cartItem.id, match.id));
        } else {
          await db.insert(cartItem).values({
            id: crypto.randomUUID(),
            cartId: userCart.id,
            productId: guestItem.productId,
            variantId: guestItem.variantId,
            quantity: guestItem.quantity,
            priceCents: guestItem.priceCents,
          });
        }
      }
      await db.delete(cart).where(eq(cart.id, guestCart.id));
      await db
        .update(cart)
        .set({ sessionToken: null })
        .where(eq(cart.id, userCart.id));
    } else {
      await db
        .update(cart)
        .set({ userId: user.id, sessionToken: null })
        .where(eq(cart.id, guestCart.id));
    }

    return c.json({ message: "Cart merged successfully" });
  } catch (error) {
    console.error("Error merging cart:", error);
    return c.json({ error: "Failed to merge cart" }, 500);
  }
});

export default cartRoutes;
