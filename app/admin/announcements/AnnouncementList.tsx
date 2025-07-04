"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import { Announcement } from "../page";

interface AnnouncementListProps {
  announcements: Announcement[];
  onEdit: (id: string) => void;
  onDelete: (announcement: Announcement) => void;
}

export default function AnnouncementList({ announcements, onEdit, onDelete }: AnnouncementListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Message</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Active</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {announcements.map((announcement) => (
          <TableRow key={announcement.id}>
            <TableCell>{announcement.title}</TableCell>
            <TableCell>{announcement.message}</TableCell>
            <TableCell>{announcement.type}</TableCell>
            <TableCell>{announcement.active ? "Yes" : "No"}</TableCell>
            <TableCell>{announcement.created}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" onClick={() => onEdit(announcement.id)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(announcement)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}