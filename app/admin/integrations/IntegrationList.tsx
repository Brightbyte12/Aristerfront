import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const IntegrationList = ({ integrations, onConnect, onDisconnect }: any) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Integration</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {integrations.map((integration: any) => (
          <TableRow key={integration.id}>
            <TableCell className="font-medium">{integration.name}</TableCell>
            <TableCell>{integration.connected ? "Connected" : "Not Connected"}</TableCell>
            <TableCell>
              {integration.connected ? (
                <Button size="sm" variant="outline" onClick={() => onDisconnect(integration.id)}>
                  Disconnect
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => onConnect(integration.id)}>
                  Connect
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default IntegrationList; 