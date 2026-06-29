import React, { useState } from "react";
import Card, { CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Link, Copy } from "lucide-react";
import {useAlert
 } from "../../helpers/AlertContent";

const NotificationLink = () => {
  const { showAlert } =useAlert
();
  const [generatedLink, setGeneratedLink] = useState("");

  const handleGenerate = () => {
    const link = `https://caoffice.com/secure/request/req-${Math.floor(100000 + Math.random() * 900000)}`;
    setGeneratedLink(link);
    showAlert({ type: "success", title: "Link Generated", message: "Short link generated successfully." });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    showAlert({ type: "success", title: "Copied!", message: "Link copied to clipboard." });
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-[#04364A] via-[#06506B] to-[#022B3A] shadow-md text-white">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Link size={24} /> Client Notification Links
        </h1>
        <p className="text-white/70 text-sm mt-1">
          Generate quick links for document collection, signature requests, or payment gateways.
        </p>
      </div>

      <Card>
        <CardBody className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#04506B]">
              <option>Document Upload Link</option>
              <option>Outstanding Invoice Payment Link</option>
              <option>ITR Computation Draft Approval Link</option>
            </select>
          </div>

          <Button onClick={handleGenerate}>
            Generate Secure Link
          </Button>

          {generatedLink && (
            <div className="mt-4 p-3 bg-gray-50 border rounded-xl flex items-center justify-between gap-4">
              <span className="font-mono text-sm text-[#04506B] truncate select-all">{generatedLink}</span>
              <button
                onClick={handleCopy}
                className="p-2 bg-white border hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                title="Copy Link"
              >
                <Copy size={16} />
              </button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default NotificationLink;
