"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying things out",
    features: [
      "5 audio files per month",
      "Max 10 min per file",
      "Standard quality",
      "Email support",
    ],
    cta: "Current plan",
    isCurrent: true,
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For serious content creators",
    features: [
      "Unlimited audio files",
      "Max 2 hours per file",
      "Studio quality output",
      "Priority processing",
      "Batch processing",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    isCurrent: false,
    highlighted: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "/month",
    description: "For studios and teams",
    features: [
      "Everything in Pro",
      "5 team members",
      "API access",
      "Custom presets",
      "Dedicated support",
      "SLA guarantee",
    ],
    cta: "Contact sales",
    isCurrent: false,
    highlighted: false,
  },
];

export default function BillingPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-display font-bold tracking-tight">
            Plans & Billing
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Choose the plan that fits your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "glass rounded-3xl p-6 flex flex-col relative",
                plan.highlighted && "gradient-border active glow-violet"
              )}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              )}

              <div className="mb-5">
                <h3 className="text-base font-display font-semibold text-text-primary">
                  {plan.name}
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  {plan.description}
                </p>
              </div>

              <div className="mb-5">
                <span className="text-3xl font-display font-bold text-text-primary">
                  {plan.price}
                </span>
                <span className="text-sm text-text-muted ml-1">
                  {plan.period}
                </span>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-text-secondary"
                  >
                    <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.highlighted ? "default" : "outline"}
                disabled={plan.isCurrent}
                className="w-full"
              >
                {plan.isCurrent ? (
                  <>
                    <CreditCard className="h-4 w-4" />
                    {plan.cta}
                  </>
                ) : (
                  plan.cta
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
