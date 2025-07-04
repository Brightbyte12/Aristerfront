import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  active: boolean;
  created: string;
}

interface AnnouncementFormProps {
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  formState: Announcement;
  setFormState: React.Dispatch<React.SetStateAction<Announcement>>;
  isSubmitting: boolean;
}

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({
  onSubmit,
  onCancel,
  formState,
  setFormState,
  isSubmitting,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formState.title}
          onChange={(e) => setFormState({ ...formState, title: e.target.value })}
          placeholder="Enter announcement title"
          required
        />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={formState.message}
          onChange={(e) => setFormState({ ...formState, message: e.target.value })}
          placeholder="Enter announcement message"
          required
        />
      </div>
      <div>
        <Label htmlFor="type">Type</Label>
        <Select
          value={formState.type}
          onValueChange={(value) => setFormState({ ...formState, type: value as Announcement['type'] })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={formState.active}
          onCheckedChange={(checked) => setFormState({ ...formState, active: checked })}
        />
        <Label htmlFor="active">Active</Label>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
};

export default AnnouncementForm;