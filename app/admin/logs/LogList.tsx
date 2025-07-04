"use client";

import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { format } from "date-fns";

interface Log {
  _id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  meta?: any;
}

const LogList = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get('/api/logs');
        setLogs(data);
      } catch (error) {
        console.error("Failed to fetch logs", error);
        toast({
          title: 'Error',
          description: 'Could not load system logs.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, [toast]);

  const handleViewLog = (log: Log) => {
    setSelectedLog(log);
    setIsViewOpen(true);
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warn': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return <div>Loading logs...</div>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log._id}>
              <TableCell>{format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss')}</TableCell>
              <TableCell>
                <Badge variant={getLevelBadge(log.level)}>{log.level.toUpperCase()}</Badge>
              </TableCell>
              <TableCell className="max-w-md truncate">{log.message}</TableCell>
              <TableCell>
                <Button size="sm" variant="outline" onClick={() => handleViewLog(log)}>
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div><strong>Timestamp:</strong> {format(new Date(selectedLog.timestamp), 'PPpp')}</div>
              <div><strong>Level:</strong> <Badge variant={getLevelBadge(selectedLog.level)}>{selectedLog.level.toUpperCase()}</Badge></div>
              <div><strong>Message:</strong> <p className="p-2 bg-gray-100 rounded-md">{selectedLog.message}</p></div>
              {selectedLog.meta && (
                <div>
                  <strong>Metadata:</strong>
                  <pre className="p-2 bg-gray-100 rounded-md text-sm">
                    {JSON.stringify(selectedLog.meta, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LogList; 