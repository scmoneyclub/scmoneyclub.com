"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ValidateInviteProps {
  onSubmit?: (inviteCode: string) => Promise<void> | void;
  loading?: boolean;
  errorMessage?: string;
  className?: string;
}

export default function ValidateInvite({ onSubmit, loading = false, errorMessage, className }: ValidateInviteProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const codeError = touched && inviteCode.trim().length === 0 ? "Invite code is required" : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (inviteCode.trim().length === 0) return;
    if (!onSubmit) return;
    try {
      setSubmitting(true);
      await onSubmit(inviteCode.trim());
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="invite-code">Invite Code</Label>
          <Input
            id="invite-code"
            placeholder="Enter your invite code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={!!codeError}
          />
          {(codeError || errorMessage) && (
            <p className="text-red-500 text-xs m-0">{codeError || errorMessage}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={loading || submitting}>
          {loading || submitting ? "Validating..." : "Get Access"}
        </Button>
      </div>
    </form>
  );
}
