import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Barcode from 'react-barcode';
import html2canvas from 'html2canvas';
import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from "@/components/ui/badge";
import * as XLSX from 'xlsx';
import { Input } from "@/components/ui/input";

const downloadBarcode = async (barcodeRef: React.RefObject<HTMLDivElement | null>, productName: string) => {
  if (!barcodeRef.current) return;
  const canvas = await html2canvas(barcodeRef.current);
  const link = document.createElement('a');
  link.download = `${productName}-barcode.png`;
  link.href = canvas.toDataURL();
  link.click();
};

const InventoryList = ({ products, onUpdateStock }: any) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [newStock, setNewStock] = useState('');
  const [search, setSearch] = useState("");

  // Get all individual variants for better stock management
  const getAllVariants = (products: any[]) => {
    const allVariants: any[] = [];
    products.forEach(product => {
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach((variant: any, idx: number) => {
          allVariants.push({
            ...product,
            variant,
            variantIndex: idx,
            sku: `SKU-${product.id.toString().padStart(4, "0")}-${variant.color}-${variant.size || 'NOSIZE'}`,
            displayName: `${product.name} - ${variant.color}${variant.size ? ` (${variant.size})` : ''}`,
          });
        });
      } else {
        // For products without variants, create a default entry
        allVariants.push({
          ...product,
          variant: { color: '-', size: '-', stock: product.stock || 0 },
          variantIndex: -1,
          sku: `SKU-${product.id.toString().padStart(4, "0")}-DEFAULT`,
          displayName: product.name,
        });
      }
    });
    return allVariants;
  };

  const allVariants = getAllVariants(products);

  // Filter variants by search
  const filteredVariants = allVariants.filter((row: any) => {
    const searchText = search.toLowerCase();
    return (
      row.name?.toLowerCase().includes(searchText) ||
      row.variant.color?.toLowerCase().includes(searchText) ||
      (row.variant.size || "").toLowerCase().includes(searchText) ||
      row.sku?.toLowerCase().includes(searchText) ||
      (row.category || "").toLowerCase().includes(searchText)
    );
  });

  // Download inventory as Excel
  const handleDownloadExcel = () => {
    const data = filteredVariants.map(row => ({
      Product: row.name,
      Color: row.variant.color,
      Size: row.variant.size || '-',
      SKU: row.sku,
      Barcode: row.barcode || '',
      Stock: row.variant.stock || 0
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
    XLSX.writeFile(workbook, 'inventory.xlsx');
  };

  const handleUpdateStock = (product: any) => {
    setSelectedProduct(product);
    setNewStock(product.variant.stock?.toString() || '0');
    setDialogOpen(true);
  };

  const handleSaveStock = () => {
    if (!selectedProduct) return;
    const stockNum = parseInt(newStock, 10);
    if (isNaN(stockNum) || stockNum < 0) return;
    
    if (selectedProduct.variantIndex >= 0) {
      onUpdateStock(selectedProduct.id, stockNum, selectedProduct.variantIndex);
    } else {
      onUpdateStock(selectedProduct.id, stockNum);
    }
    setDialogOpen(false);
  };

  return (
    <>
    <div className="flex justify-between items-center mb-4">
      <div>
        <h2 className="text-lg font-semibold">Inventory Management</h2>
        <p className="text-sm text-gray-600">Manage stock levels for all product variants</p>
      </div>
      <div className="flex gap-2 items-center">
        <Input
          type="text"
          placeholder="Search inventory..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-56"
        />
        <Button variant="outline" onClick={handleDownloadExcel}>
          Download as Excel
        </Button>
      </div>
    </div>
    
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barcode</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white divide-y divide-gray-200">
          {filteredVariants.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="px-4 py-8 text-center text-gray-500">
                No products available in inventory.
              </TableCell>
            </TableRow>
          ) : (
            filteredVariants.map((row: any, idx: number) => {
              let barcodeRef: HTMLDivElement | null = null;
              const stockLevel = row.variant.stock || 0;
              
              return (
                <TableRow key={`${row.id}-${row.variant.color}-${row.variant.size}-${idx}`} className="hover:bg-gray-50">
                  <TableCell className="px-4 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{row.name}</div>
                      <div className="text-sm text-gray-500">ID: {row.id}</div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: row.variant.color !== '-' ? row.variant.color.toLowerCase() : '#ccc' }}
                      ></div>
                      <span>{row.variant.color}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <Badge variant="outline">{row.variant.size || '-'}</Badge>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{row.sku}</code>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div ref={el => { barcodeRef = el; }} style={{ display: 'inline-block', background: '#fff', padding: 4 }}>
                        {row.barcode ? (
                          <>
                            <Barcode value={row.barcode} width={1.2} height={40} fontSize={12} displayValue={false} />
                            <div style={{ fontSize: 10, marginTop: 4, textAlign: 'left', color: '#222', lineHeight: 1.2 }}>
                              <div><b>{row.name}</b></div>
                              <div>Category: {row.category || '-'}</div>
                              <div>Price: ₹{row.price}</div>
                              <div>Stock: {row.variant.stock}</div>
                              <div>Color: {row.variant.color}</div>
                              {row.variant.size && row.variant.size !== '-' && (
                                <div>Size: {row.variant.size}</div>
                              )}
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </div>
                      {row.barcode && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => downloadBarcode({ current: barcodeRef }, row.displayName)}
                        >
                          Download
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    {/* Stock badge logic */}
                    {stockLevel === 0 ? (
                      <Badge variant="destructive">Out of Stock</Badge>
                    ) : stockLevel <= 5 ? (
                      <Badge variant="secondary">Low Stock ({stockLevel})</Badge>
                    ) : (
                      <Badge variant="default">{stockLevel} in stock</Badge>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStock(row)}
                    >
                      Update Stock
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>

    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Stock</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <span className="text-sm font-medium text-gray-700">Product: </span>
            <span className="font-semibold">{selectedProduct?.name}</span>
          </div>
          {selectedProduct?.variant && (
            <div className="flex items-center gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Color: </span>
                <div className="flex items-center gap-2 mt-1">
                  <div 
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: selectedProduct.variant.color !== '-' ? selectedProduct.variant.color.toLowerCase() : '#ccc' }}
                  ></div>
                  <span className="font-semibold">{selectedProduct.variant.color}</span>
                </div>
              </div>
              {selectedProduct.variant.size && selectedProduct.variant.size !== '-' && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Size: </span>
                  <Badge variant="outline" className="ml-1">{selectedProduct.variant.size}</Badge>
                </div>
              )}
            </div>
          )}
          <div>
            <label htmlFor="stock-input" className="block text-sm font-medium text-gray-700 mb-1">New Stock Quantity</label>
            <input
              id="stock-input"
              type="number"
              min={0}
              value={newStock}
              onChange={e => setNewStock(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
              placeholder="Enter stock quantity"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            disabled={!newStock || isNaN(Number(newStock)) || Number(newStock) < 0}
            onClick={handleSaveStock}
          >
            Update Stock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default InventoryList; 