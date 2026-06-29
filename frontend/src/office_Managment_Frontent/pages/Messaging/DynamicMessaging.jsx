import React, { useState } from "react";
import Card, { CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { MessageSquare, Send } from "lucide-react";
import {useAlert
 } from "../../helpers/AlertContent";

const DynamicMessaging = () => {
  const { showAlert } =useAlert
();
  const [message, setMessage] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    showAlert({ type: "success", title: "Broadcast Sent", message: "Update dispatched to all client portals." });
    setMessage("");
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-[#04364A] via-[#06506B] to-[#022B3A] shadow-md text-white">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare size={24} /> Client Dynamic Messaging
        </h1>
        <p className="text-white/70 text-sm mt-1">
          Broadcast SMS, WhatsApp, and Portal alerts to active client categories.
        </p>
      </div>

      <Card>
        <CardBody className="p-6">
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Client Group</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#04506B]">
                <option>All Clients</option>
                <option>GST Monthly Clients</option>
                <option>Audit Required Corporate Clients</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Broadcast Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#04506B]"
                placeholder="e.g. Dear client, this is a reminder that the GST return filing deadline for April 2026 is approaching..."
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" leftIcon={Send}>
                Send Message Broadcast
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default DynamicMessaging;
