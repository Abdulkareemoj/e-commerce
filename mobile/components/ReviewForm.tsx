import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { FormInput } from '@/components/ui/form-input';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { StarRating } from '@/components/StarRating';
import { api } from '@/lib/api';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating'),
  title: z.string().optional(),
  body: z.string().optional(),
});

type ReviewData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ productId, onSuccess, onCancel }: ReviewFormProps) {
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { control, handleSubmit, reset } = useForm<ReviewData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, title: '', body: '' },
  });

  const onSubmit = React.useCallback(async (data: ReviewData) => {
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/user/reviews/${productId}`, {
        rating: data.rating,
        title: data.title || undefined,
        body: data.body || undefined,
      });
      reset({ rating: 0, title: '', body: '' });
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  }, [productId, onSuccess, reset]);

  return (
    <View className="gap-4">
      {error ? <Text className="text-sm text-destructive">{error}</Text> : null}

      <Controller
        control={control}
        name="rating"
        render={({ field: { onChange, value }, fieldState: { error: fieldError } }) => (
          <Field invalid={!!fieldError}>
            <FieldContent>
              <FieldLabel>Rating</FieldLabel>
              <StarRating rating={value} size={24} interactive onRate={onChange} />
              <FieldError errors={fieldError ? [fieldError] : []} />
            </FieldContent>
          </Field>
        )}
      />

      <FormInput control={control} name="title" label="Title (optional)" placeholder="Summary of your review" />
      <FormInput control={control} name="body" label="Review (optional)" placeholder="Tell others about your experience..." multiline />

      <View className="flex-row gap-3">
        {onCancel ? (
          <Button variant="outline" className="flex-1" onPress={onCancel}>
            <Text>Cancel</Text>
          </Button>
        ) : null}
        <Button className="flex-1" onPress={handleSubmit(onSubmit)} disabled={submitting}>
          <Text>{submitting ? 'Submitting...' : 'Submit Review'}</Text>
        </Button>
      </View>
    </View>
  );
}
