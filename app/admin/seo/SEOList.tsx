import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const SEOList = ({ seoPages, onEdit }: any) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Page</TableHead>
          <TableHead>Meta Title</TableHead>
          <TableHead>Meta Description</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {seoPages.map((page: any) => (
          <TableRow key={page.id}>
            <TableCell className="font-medium">{page.name}</TableCell>
            <TableCell>{page.metaTitle}</TableCell>
            <TableCell>{page.metaDescription}</TableCell>
            <TableCell>
              <Button size="sm" variant="outline" onClick={() => onEdit(page.id)}>
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SEOList; 