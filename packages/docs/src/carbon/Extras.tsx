import { useState } from "react";
import { Button, ClickableTile, Tag, InlineNotification } from "@carbon/react";
import {
  Document,
  BareMetalServer,
  Settings,
  UserMultiple,
} from "@carbon/icons-react";
import { docsLabels } from "../i18n/labels.js";
import { docUrl, type DocsConfig } from "../config.js";
import type { DocsLayoutProps } from "./DocsLayout.js";
export function QuickLinks({
  config,
  locale,
  entries,
}: {
  config: DocsConfig;
  locale: string;
  entries: DocsLayoutProps["entries"];
}) {
  const text = (values: Record<string, string>) =>
    values[locale] || values[config.fallbackLocale] || "";
  const icons: Record<string, typeof Document> = {
    server: BareMetalServer,
    settings: Settings,
    users: UserMultiple,
  };
  return (
    <div className="qd-quickLinks">
      {config.quickLinks.map((card) => {
        const Icon = icons[card.icon || ""] || Document;
        return (
          <ClickableTile
            key={card.id}
            href={docUrl(config, locale, card.items[0])}
          >
            <Icon size={24} />
            <Tag type={card.tagType}>{text(card.tag)}</Tag>
            <h2>{text(card.title)}</h2>
            <p>{text(card.description)}</p>
            <ul>
              {card.items.map((slug) => (
                <li key={slug}>
                  {entries.find((p) => p.slug === slug)?.title || slug}
                </li>
              ))}
            </ul>
          </ClickableTile>
        );
      })}
    </div>
  );
}
/** Local acknowledgement, matching the original docs UI; no analytics/network collection. */
export function DocFeedback({ locale }: { locale: string }) {
  const [submitted, setSubmitted] = useState(false);
  const label = docsLabels(locale);
  return (
    <div className="qd-feedback">
      {submitted ? (
        <InlineNotification
          kind="success"
          title={label.thanks}
          hideCloseButton
          lowContrast
        />
      ) : (
        <>
          <span>{label.feedback}</span>
          <Button kind="ghost" size="sm" onClick={() => setSubmitted(true)}>
            {label.helpful}
          </Button>
          <Button kind="ghost" size="sm" onClick={() => setSubmitted(true)}>
            {label.notHelpful}
          </Button>
        </>
      )}
    </div>
  );
}
