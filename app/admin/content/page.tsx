"use client";

import React, { useEffect, useState } from "react";
import ContentList from "./ContentList";
import ContentEditor from "./ContentEditor";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const AdminContentPage = () => {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<any | null>(null);
  const [viewingPage, setViewingPage] = useState<any | null>(null);

  // Fetch all content pages
  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/content-pages`, { credentials: 'include' });
      const data = await res.json();
      setPages(data);
    } catch (err) {
      // handle error
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // Add new page
  const handleAdd = () => {
    setEditingPage(null);
    setEditorOpen(true);
  };

  // Edit page
  const handleEdit = (id: string) => {
    const page = pages.find((p: any) => p._id === id);
    setEditingPage(page);
    setEditorOpen(true);
  };

  // View page
  const handleView = (id: string) => {
    const page = pages.find((p: any) => p._id === id);
    setViewingPage(page);
  };

  // Save (create or update)
  const handleSave = async (data: any) => {
    setLoading(true);
    try {
      if (editingPage) {
        // Update
        await fetch(`${API_URL}/api/content-pages/${editingPage._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
          body: JSON.stringify(data),
        });
      } else {
        // Create
        await fetch(`${API_URL}/api/content-pages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
          body: JSON.stringify(data),
        });
      }
      setEditorOpen(false);
      setEditingPage(null);
      fetchPages();
    } catch (err) {
      // handle error
    }
    setLoading(false);
  };

  // Cancel editor
  const handleCancel = () => {
    setEditorOpen(false);
    setEditingPage(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Content Pages</h1>
        <Button onClick={handleAdd}>Add New Page</Button>
      </div>
      {loading && <div>Loading...</div>}
      <ContentList pages={pages} onEdit={handleEdit} onView={handleView} />
      {editorOpen && (
        <ContentEditor
          initialData={editingPage}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
      {/* Simple view modal */}
      {viewingPage && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 max-w-2xl w-full relative">
            <button className="absolute top-2 right-2 text-gray-500" onClick={() => setViewingPage(null)}>&times;</button>
            <h2 className="text-xl font-bold mb-2">{viewingPage.title}</h2>
            <div className="text-xs text-gray-400 mb-2">/{viewingPage.slug}</div>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: viewingPage.content }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContentPage; 
