"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Ruler } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SizeGuideModalProps {
  isOpen: boolean
  onClose: () => void
  category?: string
}

const mensSizeChart = {
  shirts: [
    { size: "S", chest: "36-38", waist: "30-32", length: "28" },
    { size: "M", chest: "38-40", waist: "32-34", length: "29" },
    { size: "L", chest: "40-42", waist: "34-36", length: "30" },
    { size: "XL", chest: "42-44", waist: "36-38", length: "31" },
    { size: "XXL", chest: "44-46", waist: "38-40", length: "32" },
  ],
  tshirts: [
    { size: "S", chest: "34-36", waist: "28-30", length: "26" },
    { size: "M", chest: "36-38", waist: "30-32", length: "27" },
    { size: "L", chest: "38-40", waist: "32-34", length: "28" },
    { size: "XL", chest: "40-42", waist: "34-36", length: "29" },
    { size: "XXL", chest: "42-44", waist: "36-38", length: "30" },
  ],
  trousers: [
    { size: "30", waist: "30", hip: "38", length: "40" },
    { size: "32", waist: "32", hip: "40", length: "40" },
    { size: "34", waist: "34", hip: "42", length: "40" },
    { size: "36", waist: "36", hip: "44", length: "40" },
    { size: "38", waist: "38", hip: "46", length: "40" },
  ],
}

export default function SizeGuideModal({ isOpen, onClose, category = "shirts" }: SizeGuideModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-responsive-xl">
              <Ruler className="w-5 h-5" />
              Size Guide
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="touch-target">
              <X className="w-4 h-4" />
              <span className="sr-only">Close size guide</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="shirts" className="w-full">
            <TabsList className="grid w-full grid-cols-3 text-responsive-sm">
              <TabsTrigger value="shirts">Shirts</TabsTrigger>
              <TabsTrigger value="tshirts">T-Shirts</TabsTrigger>
              <TabsTrigger value="trousers">Trousers</TabsTrigger>
            </TabsList>

            <TabsContent value="shirts" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-responsive-lg font-semibold">Men's Shirts Size Chart</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-responsive-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-3 text-left">Size</th>
                        <th className="border border-gray-300 p-3 text-left">Chest (inches)</th>
                        <th className="border border-gray-300 p-3 text-left">Waist (inches)</th>
                        <th className="border border-gray-300 p-3 text-left">Length (inches)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mensSizeChart.shirts.map((row, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 p-3 font-medium">{row.size}</td>
                          <td className="border border-gray-300 p-3">{row.chest}</td>
                          <td className="border border-gray-300 p-3">{row.waist}</td>
                          <td className="border border-gray-300 p-3">{row.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tshirts" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-responsive-lg font-semibold">Men's T-Shirts Size Chart</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-responsive-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-3 text-left">Size</th>
                        <th className="border border-gray-300 p-3 text-left">Chest (inches)</th>
                        <th className="border border-gray-300 p-3 text-left">Waist (inches)</th>
                        <th className="border border-gray-300 p-3 text-left">Length (inches)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mensSizeChart.tshirts.map((row, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 p-3 font-medium">{row.size}</td>
                          <td className="border border-gray-300 p-3">{row.chest}</td>
                          <td className="border border-gray-300 p-3">{row.waist}</td>
                          <td className="border border-gray-300 p-3">{row.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trousers" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-responsive-lg font-semibold">Men's Trousers Size Chart</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-responsive-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-3 text-left">Size</th>
                        <th className="border border-gray-300 p-3 text-left">Waist (inches)</th>
                        <th className="border border-gray-300 p-3 text-left">Hip (inches)</th>
                        <th className="border border-gray-300 p-3 text-left">Length (inches)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mensSizeChart.trousers.map((row, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 p-3 font-medium">{row.size}</td>
                          <td className="border border-gray-300 p-3">{row.waist}</td>
                          <td className="border border-gray-300 p-3">{row.hip}</td>
                          <td className="border border-gray-300 p-3">{row.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2 text-responsive-base">How to Measure</h4>
            <ul className="text-responsive-sm text-blue-700 space-y-1">
              <li>
                • <strong>Chest:</strong> Measure around the fullest part of your chest
              </li>
              <li>
                • <strong>Waist:</strong> Measure around your natural waistline
              </li>
              <li>
                • <strong>Hip:</strong> Measure around the fullest part of your hips
              </li>
              <li>
                • <strong>Length:</strong> Measure from shoulder to desired hem length
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
