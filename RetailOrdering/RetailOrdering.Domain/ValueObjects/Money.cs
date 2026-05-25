using System;

namespace RetailOrdering.Domain.ValueObjects
{
    public class Money
    {
        public decimal Amount { get; private set; }
        public string Currency { get; private set; } = "USD";

        private Money() { } // EF Core required

        public Money(decimal amount, string currency = "USD")
        {
            if (amount < 0) throw new ArgumentException("Amount cannot be negative.", nameof(amount));
            Amount = amount;
            Currency = currency ?? "USD";
        }

        public static Money Zero => new Money(0);

        public Money Add(Money other)
        {
            ValidateSameCurrency(other);
            return new Money(Amount + other.Amount, Currency);
        }

        public Money Subtract(Money other)
        {
            ValidateSameCurrency(other);
            return new Money(Math.Max(0, Amount - other.Amount), Currency);
        }

        private void ValidateSameCurrency(Money other)
        {
            if (Currency != other.Currency)
                throw new InvalidOperationException("Currencies must match for monetary operations.");
        }
    }
}
