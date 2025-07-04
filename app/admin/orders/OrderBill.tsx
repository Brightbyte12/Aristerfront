import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileDown, Printer, Upload } from "lucide-react";
import { format } from "date-fns";
import { Order, OrderItem } from './OrderList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OrderBillProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

const OrderBill: React.FC<OrderBillProps> = ({ order, isOpen, onClose }) => {
  const [editableOrder, setEditableOrder] = useState(order);
  const [billNumber, setBillNumber] = useState(`BILL-${order.orderId}`);
  const [gstNumber, setGstNumber] = useState("YOUR-GST-NUMBER");
  const [brandName, setBrandName] = useState("Arister");
  const [stampImage, setStampImage] = useState<string | null>(null);
  const billRef = useRef<HTMLDivElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditableOrder(order);
    setBillNumber(`BILL-${order.orderId}`);
  }, [order]);

  useEffect(() => {
    const recalculateTotals = () => {
      const subTotal = editableOrder.items.reduce((acc: number, item: OrderItem) => acc + (item.price * item.quantity), 0);
      const total = subTotal - (editableOrder.discount || 0) + (editableOrder.codCharge || 0);
      setEditableOrder((prev: Order) => ({ ...prev, subTotal, total }));
    };
    recalculateTotals();
  }, [editableOrder.items, editableOrder.discount, editableOrder.codCharge]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const [section, field] = name.split('.');
    
    if (section === 'address') {
      setEditableOrder((prev: Order) => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    }
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const updatedItems = [...editableOrder.items];
    const item = { ...updatedItems[index] } as OrderItem;
    if (field === 'price' || field === 'quantity') {
      (item as any)[field] = Number(value) || 0;
    } else {
      (item as any)[field] = value;
    }
    updatedItems[index] = item;
    setEditableOrder((prev: Order) => ({ ...prev, items: updatedItems }));
  };

  const handleAmountChange = (field: 'discount' | 'codCharge', value: string) => {
    setEditableOrder((prev: Order) => ({
      ...prev,
      [field]: Number(value) || 0
    }));
  };

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setStampImage(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const getPrintableContent = () => {
    const printableElement = billRef.current?.cloneNode(true) as HTMLElement;
    
    printableElement.querySelectorAll('input, textarea').forEach(el => {
      const p = document.createElement('p');
      p.textContent = (el as HTMLInputElement).value;
      if(el.classList.contains('text-right')) p.style.textAlign = 'right';
      el.parentNode?.replaceChild(p, el);
    });

    const stampContainer = printableElement.querySelector('.stamp-container');
    if (stampContainer) {
      if (stampImage) {
        const img = document.createElement('img');
        img.src = stampImage;
        img.alt = 'Stamp';
        img.style.width = '100px';
        img.style.height = '100px';
        img.style.marginTop = '10px';
        img.style.marginLeft = 'auto';
        img.style.marginRight = 'auto';
        stampContainer.innerHTML = '';
        stampContainer.appendChild(img);
      } else {
        stampContainer.remove();
      }
    }

    return printableElement.innerHTML;
  };

  const handlePrint = () => {
    const printContent = getPrintableContent();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>Order Bill - ${order.orderId}</title>
        <style>
          body { font-family: Arial, sans-serif; }
          .bill-container { max-width: 800px; margin: 20px auto; padding: 20px; background-color: white; }
          .bill-header { text-align: center; margin-bottom: 20px; }
          .bill-details { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
          .bill-table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
          .bill-table th, .bill-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .text-right { text-align: right; }
          .amount-summary { margin-top: 1.5rem; text-align: right; }
          .bill-footer { margin-top: 2rem; text-align: center; font-size: 0.875rem; color: #6b7280; }
        </style>
        </head><body>${printContent}</body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    const billContent = `<html><head><title>Order Bill - ${order.orderId}</title>
    <style>
      body { font-family: Arial, sans-serif; }
      .bill-container { max-width: 800px; margin: 20px auto; padding: 20px; background-color: white; }
      .bill-header { text-align: center; margin-bottom: 20px; }
      .bill-details { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
      .bill-table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
      .bill-table th, .bill-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      .text-right { text-align: right; }
      .amount-summary { margin-top: 1.5rem; text-align: right; }
      .bill-footer { margin-top: 2rem; text-align: center; font-size: 0.875rem; color: #6b7280; }
    </style>
    </head><body>${getPrintableContent()}</body></html>`;
    const blob = new Blob([billContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bill-${order.orderId}.html`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Generate & Edit Bill</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4" style={{maxHeight: '80vh'}}>
          <div className="md:col-span-2 overflow-y-auto pr-4">
            <div ref={billRef} className="bill-container p-6 bg-white rounded-lg border">
              <div className="bill-header text-center mb-6">
                <Input
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="text-3xl font-bold border-none shadow-none text-center p-0 h-auto"
                  placeholder="Arister"
                />
                <h2 className="text-xl font-semibold mt-2">Tax Invoice</h2>
                <Input
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="text-sm text-gray-500 border-none shadow-none text-center p-0 h-auto"
                  placeholder="GST Number"
                />
              </div>

              <div className="bill-details grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Bill To:</h3>
                  <div className="space-y-1">
                    <Input name="address.name" value={editableOrder.address.name} onChange={handleInputChange} placeholder="Name" />
                    <Textarea name="address.addressLine1" value={editableOrder.address.addressLine1} onChange={handleInputChange} placeholder="Address" rows={2} />
                    <div className="grid grid-cols-2 gap-2">
                      <Input name="address.city" value={editableOrder.address.city} onChange={handleInputChange} placeholder="City" />
                      <Input name="address.state" value={editableOrder.address.state} onChange={handleInputChange} placeholder="State" />
                    </div>
                    <Input name="address.postalCode" value={editableOrder.address.postalCode} onChange={handleInputChange} placeholder="Postal Code" />
                    <Input name="address.phone" value={editableOrder.address.phone} onChange={handleInputChange} placeholder="Phone" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end mb-2">
                    <Label htmlFor="billNumber" className="mr-2 font-semibold shrink-0">Bill No:</Label>
                    <Input id="billNumber" value={billNumber} onChange={(e) => setBillNumber(e.target.value)} className="w-auto text-right" />
                  </div>
                  <p className="text-sm"><strong>Order ID:</strong> {order.orderId}</p>
                  <p className="text-sm"><strong>Date:</strong> {format(new Date(order.createdAt), 'dd/MM/yyyy')}</p>
                </div>
              </div>

              <div className="mt-4">
                <table className="bill-table w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-2 px-3">Item</th>
                      <th className="py-2 px-3">SKU</th>
                      <th className="py-2 px-3 text-right">Price</th>
                      <th className="py-2 px-3 text-right">Qty</th>
                      <th className="py-2 px-3 text-right">Total</th>
                      <th className="py-2 px-3 text-right">Discount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editableOrder.items.map((item: OrderItem, index: number) => (
                      <tr key={item.id || index}>
                        <td className="p-1"><Input className="h-8" value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} /></td>
                        <td className="p-1"><Input className="h-8" value={item.sku || ''} onChange={(e) => handleItemChange(index, 'sku', e.target.value)} /></td>
                        <td className="p-1"><Input className="h-8 text-right" type="number" value={item.price} onChange={(e) => handleItemChange(index, 'price', e.target.value)} /></td>
                        <td className="p-1"><Input className="h-8 text-right" type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} /></td>
                        <td className="p-1 text-right">₹{(item.price * item.quantity).toFixed(2)}</td>
                        <td className="p-1 text-right">{index === 0 && editableOrder.discount ? `₹${editableOrder.discount.toFixed(2)}` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="amount-summary mt-4 text-right">
                <div className="space-y-1 max-w-xs ml-auto">
                  <div className="flex justify-between items-center"><p className="font-semibold">Subtotal:</p> <p>₹{(editableOrder.subTotal || 0).toFixed(2)}</p></div>
                  {editableOrder.discountCode && (
                    <div className="flex justify-between items-center text-green-700 font-semibold">
                      <span>Discount Code Used:</span>
                      <span>{editableOrder.discountCode}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <Label>Discount:</Label>
                    <Input type="number" value={editableOrder.discount || 0} onChange={(e) => handleAmountChange('discount', e.target.value)} className="w-24 h-8 text-right" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Label>COD Charge:</Label>
                    <Input type="number" value={editableOrder.codCharge || 0} onChange={(e) => handleAmountChange('codCharge', e.target.value)} className="w-24 h-8 text-right" />
                  </div>
                  <hr className="my-1" />
                  <div className="flex justify-between items-center text-base font-bold"><p>Total:</p> <p>₹{(editableOrder.total || 0).toFixed(2)}</p></div>
                </div>
              </div>

              <div className="bill-footer mt-6 text-center text-sm text-gray-500">
                <p>Thank you for your business!</p>
                <div className="stamp-container mt-2">
                  <p className="font-semibold">Signature / Stamp</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Stamp / Signature</CardTitle></CardHeader>
              <CardContent className="flex flex-col items-center space-y-2">
                {stampImage ? (
                  <img src={stampImage} alt="Stamp" className="w-28 h-28 object-contain border rounded-md" />
                ) : (
                  <div className="w-28 h-28 bg-gray-100 border rounded-md flex items-center justify-center text-xs text-gray-500">
                    No Stamp Uploaded
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={stampInputRef}
                  onChange={handleStampUpload}
                  className="hidden"
                />
                <Button size="sm" variant="outline" onClick={() => stampInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Stamp
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <DialogFooter className="px-6 pb-4">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print Bill
          </Button>
          <Button onClick={handleDownload}>
            <FileDown className="w-4 h-4 mr-2" />
            Download Bill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderBill; 