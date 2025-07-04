import React from "react";
import { Button } from "@/components/ui/button";

const BackupRestore = ({ onBackup, onRestore }: any) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Backup & Restore</h2>
      <div className="flex gap-4">
        <Button onClick={onBackup}>Create Backup</Button>
        <Button onClick={onRestore} variant="outline">Restore Backup</Button>
      </div>
      {/* List of backups, restore options, etc. can be added here */}
    </div>
  );
};

export default BackupRestore; 