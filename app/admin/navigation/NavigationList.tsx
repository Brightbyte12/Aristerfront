import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const NavigationList = ({ menus, onEdit, onView }: any) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Menu Name</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {menus.map((menu: any) => (
          <TableRow key={menu.id}>
            <TableCell className="font-medium">{menu.name}</TableCell>
            <TableCell>{menu.items.length}</TableCell>
            <TableCell>{menu.status}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(menu.id)}>
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => onView(menu.id)}>
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

export default NavigationList; 