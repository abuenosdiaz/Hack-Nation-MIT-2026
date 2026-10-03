import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Notice = ({ children }: { children: ReactNode }) => (
  <p className="notice" role="note">
    {children}
  </p>
);

export const SectionLabel = ({ children }: { children: ReactNode }) => (
  <span className="section-label">{children}</span>
);

export const ErrorNote = ({ message }: { message: string }) =>
  message ? (
    <p className="error-note" role="alert">
      {message}
    </p>
  ) : null;

export const NextButton = ({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <Button size="lg" onClick={onClick} disabled={disabled}>
    {children}
    <ArrowRight size={16} />
  </Button>
);

export function StepView({
  label,
  title,
  lead,
  children,
}: {
  label: string;
  title: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <div className="focused-view fade-up">
      <SectionLabel>{label}</SectionLabel>
      <h1>{title}</h1>
      <p className="lead">{lead}</p>
      <div className="focus-body">{children}</div>
    </div>
  );
}

export function FeedbackList({
  items,
}: {
  items: { label: string; text: string; note?: string }[];
}) {
  return (
    <div className="feedback-space" role="status">
      {items.map((item) => (
        <div className="feedback-item" key={item.label}>
          <span>{item.label}</span>
          <p>{item.text}</p>
          {item.note && <small>{item.note}</small>}
        </div>
      ))}
    </div>
  );
}
