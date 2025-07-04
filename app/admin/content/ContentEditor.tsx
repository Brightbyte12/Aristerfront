import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const PAGE_TYPES = [
  { value: "privacy-policy", label: "Privacy Policy" },
  { value: "terms-of-service", label: "Terms of Service" },
  { value: "faq", label: "FAQ" },
  { value: "size-guide", label: "Size Guide" },
  { value: "custom", label: "Custom" },
];

const STATUS_OPTIONS = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

const ContentEditor = ({ initialData, onSave, onCancel }: any) => {
  const [type, setType] = useState(initialData?.type || "privacy-policy");
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [status, setStatus] = useState(initialData?.status || "published");

  useEffect(() => {
    if (!initialData) {
      setType("privacy-policy");
      setTitle("");
      setSlug("");
      setContent("");
      setStatus("published");
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ type, title, slug, content, status });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded shadow-md max-w-xl mx-auto">
      <div>
        <label className="block font-semibold mb-1">Page Type</label>
        <select value={type} onChange={e => setType(e.target.value)} className="w-full border rounded p-2">
          {PAGE_TYPES.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-semibold mb-1">Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded p-2" required />
      </div>
      <div>
        <label className="block font-semibold mb-1">Slug (URL)</label>
        <input value={slug} onChange={e => setSlug(e.target.value)} className="w-full border rounded p-2" required />
      </div>
      <div>
        <label className="block font-semibold mb-1">Status</label>
        <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border rounded p-2">
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-semibold mb-1">Content</label>
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={10} className="w-full border rounded p-2" required />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

export default ContentEditor; 