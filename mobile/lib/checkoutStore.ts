import { create } from 'zustand';

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  isDefault?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'cod';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export type CheckoutStep = 'address' | 'shipping' | 'payment';

interface CheckoutState {
  currentStep: CheckoutStep;
  addresses: Address[];
  selectedAddressId: string | null;
  shippingMethod: 'standard' | 'express';
  paymentMethods: PaymentMethod[];
  selectedPaymentMethodId: string | null;
  isLoading: boolean;

  setStep: (step: CheckoutStep) => void;
  setAddresses: (addresses: Address[]) => void;
  selectAddress: (id: string) => void;
  addAddress: (address: Address) => void;
  removeAddress: (id: string) => void;
  setShippingMethod: (method: 'standard' | 'express') => void;
  setPaymentMethods: (methods: PaymentMethod[]) => void;
  selectPaymentMethod: (id: string) => void;
  addPaymentMethod: (method: PaymentMethod) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 'address' as CheckoutStep,
  addresses: [] as Address[],
  selectedAddressId: null as string | null,
  shippingMethod: 'standard' as 'standard' | 'express',
  paymentMethods: [] as PaymentMethod[],
  selectedPaymentMethodId: null as string | null,
  isLoading: false,
};

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),

  setAddresses: (addresses) => {
    const defaultAddr = addresses.find((a) => a.isDefault);
    set({
      addresses,
      selectedAddressId: get().selectedAddressId || defaultAddr?.id || addresses[0]?.id || null,
    });
  },

  selectAddress: (id) => set({ selectedAddressId: id }),

  addAddress: (address) => {
    const addresses = get().addresses;
    const newAddresses = address.isDefault
      ? addresses.map((a) => ({ ...a, isDefault: false }))
      : addresses;
    set({
      addresses: [...newAddresses, address],
      selectedAddressId: address.id,
    });
  },

  removeAddress: (id) => {
    const addresses = get().addresses.filter((a) => a.id !== id);
    const selectedAddressId =
      get().selectedAddressId === id ? addresses[0]?.id || null : get().selectedAddressId;
    set({ addresses, selectedAddressId });
  },

  setShippingMethod: (method) => set({ shippingMethod: method }),

  setPaymentMethods: (methods) => {
    set({
      paymentMethods: methods,
      selectedPaymentMethodId: get().selectedPaymentMethodId || methods[0]?.id || null,
    });
  },

  selectPaymentMethod: (id) => set({ selectedPaymentMethodId: id }),

  addPaymentMethod: (method) => {
    set({
      paymentMethods: [...get().paymentMethods, method],
      selectedPaymentMethodId: method.id,
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  reset: () => set(initialState),
}));
