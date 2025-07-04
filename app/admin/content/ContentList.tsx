import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const ContentList = ({ pages, onEdit, onView }: any) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Page Title</TableHead>
          <TableHead>URL</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Modified</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pages.map((page: any) => (
          <TableRow key={page.id}>
            <TableCell className="font-medium">{page.title}</TableCell>
            <TableCell>{page.url}</TableCell>
            <TableCell>{page.status}</TableCell>
            <TableCell>{page.lastModified}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(page.id)}>
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => onView(page.id)}>
                  View
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ContentList; 