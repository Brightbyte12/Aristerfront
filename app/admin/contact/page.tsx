'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth-provider';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'read' | 'replied';
  createdAt: string;
}

interface ContactInfo {
  address: string;
  email: string;
  phone: string;
  workingHours: string;
  additionalInfo?: string;
}

export default function AdminContactPage() {
  const { state } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    address: '',
    email: '',
    phone: '',
    workingHours: '',
    additionalInfo: ''
  });

  useEffect(() => {
    if (state.user?.role === 'admin') {
      fetchMessages();
      fetchContactInfo();
    }
  }, [state.user]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/contact/admin/messages`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      toast.error('Failed to fetch messages');
    }
  };

  const fetchContactInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/contact/info`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setContactInfo(data || {
          address: '',
          email: '',
          phone: '',
          workingHours: '',
          additionalInfo: ''
        });
      }
    } catch (error) {
      toast.error('Failed to fetch contact information');
    }
  };

  const updateMessageStatus = async (id: string, status: 'pending' | 'read' | 'replied') => {
    try {
      const response = await fetch(`${API_BASE_URL}/contact/admin/message/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchMessages();
        toast.success('Status updated successfully');
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const updateContactInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/contact/admin/info`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(contactInfo)
      });
      if (response.ok) {
        toast.success('Contact information updated successfully');
      }
    } catch (error) {
      toast.error('Failed to update contact information');
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/contact/admin/message/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        setMessages(messages.filter(msg => msg._id !== id));
        toast.success('Message deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  if (!state.user || state.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="text-2xl font-bold">Contact Information</CardHeader>
        <CardContent>
          <form onSubmit={updateContactInfo} className="space-y-4">
            <div>
              <label className="block mb-2">Address</label>
              <Input
                value={contactInfo.address}
                onChange={e => setContactInfo({ ...contactInfo, address: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block mb-2">Email</label>
              <Input
                type="email"
                value={contactInfo.email}
                onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block mb-2">Phone</label>
              <Input
                value={contactInfo.phone}
                onChange={e => setContactInfo({ ...contactInfo, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block mb-2">Working Hours</label>
              <Input
                value={contactInfo.workingHours}
                onChange={e => setContactInfo({ ...contactInfo, workingHours: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block mb-2">Additional Information</label>
              <Textarea
                value={contactInfo.additionalInfo}
                onChange={e => setContactInfo({ ...contactInfo, additionalInfo: e.target.value })}
              />
            </div>
            <Button type="submit">Update Contact Information</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="text-2xl font-bold">Contact Messages</CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messages.map(message => (
              <Card key={message._id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{message.subject}</h3>
                    <p className="text-sm text-gray-600">From: {message.name} ({message.email})</p>
                    <p className="text-sm text-gray-600">
                      Date: {new Date(message.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <select
                      value={message.status}
                      onChange={e => updateMessageStatus(message._id, e.target.value as any)}
                      className="border rounded p-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                    </select>
                    <Button variant="destructive" size="sm" onClick={() => deleteMessage(message._id)}>
                      Delete
                    </Button>
                  </div>
                </div>
                <p className="whitespace-pre-wrap">{message.message}</p>
              </Card>
            ))}
            {messages.length === 0 && (
              <p className="text-center text-gray-500">No messages found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 