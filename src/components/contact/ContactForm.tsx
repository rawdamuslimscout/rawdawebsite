"use client";

import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

const TOPICS = ["استفسار عام", "الانتساب", "الأنشطة والمخيمات", "اقتراح أو ملاحظة"];

const inputClass =
  "w-full rounded-xl border border-brand-purple/15 bg-white px-4 py-3 text-sm text-brand-ink placeholder:text-brand-ink/40 transition-colors focus:border-brand-purple";

/**
 * There is no mail backend, so the form composes a WhatsApp message and opens
 * the chat with it prefilled. Nothing is stored or sent until the visitor
 * presses send inside WhatsApp.
 */
export default function ContactForm({ whatsappHref }: { whatsappHref: string }) {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = [
      `مرحبًا، أنا ${name.trim()}.`,
      `الموضوع: ${topic}`,
      "",
      message.trim(),
    ].join("\n");
    window.open(
      `${whatsappHref}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div>
        <label htmlFor="contact-name" className="mb-1.5 block text-sm font-semibold text-brand-ink/80">
          الاسم
        </label>
        <input
          id="contact-name"
          name="name"
          required
          maxLength={80}
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="contact-topic" className="mb-1.5 block text-sm font-semibold text-brand-ink/80">
          الموضوع
        </label>
        <select
          id="contact-topic"
          name="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className={inputClass}
        >
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-semibold text-brand-ink/80">
          رسالتك
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          maxLength={1000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${inputClass} resize-y leading-7`}
        />
      </div>

      <div>
        <button type="submit" className="btn-purple w-full sm:w-auto">
          <FaWhatsapp className="h-[18px] w-[18px]" aria-hidden="true" />
          أرسل عبر واتساب
        </button>
        <p className="mt-2 text-xs leading-6 text-brand-ink/60">
          ستُفتح محادثة واتساب مع رسالتك جاهزة، وتُرسل عند ضغطك زر الإرسال فيها.
        </p>
      </div>
    </form>
  );
}
