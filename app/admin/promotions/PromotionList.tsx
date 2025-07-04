import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

const PromotionList = ({ promotions, onEdit, onDelete }: any) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Discount</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Uses</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {promotions.map((promo: any) => (
          <TableRow key={promo.id}>
            <TableCell className="font-medium">{promo.code}</TableCell>
            <TableCell>
              {promo.type === "Percentage" ? `${promo.discount}%` : `₹${promo.discount.toFixed(2)}`}
            </TableCell>
            <TableCell>{promo.type}</TableCell>
            <TableCell>{promo.uses}</TableCell>
            <TableCell>
              <Badge variant={promo.status === "Active" ? "default" : "secondary"}>{promo.status}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(promo.id)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDelete(promo.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PromotionList; 