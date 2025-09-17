"use client"

import { Plus, Flag, Send, Paperclip, MessageSquare, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function MessagingInterface() {
  const [openContacts, setOpenContacts] = useState(false);
  const [openSeller,   setOpenSeller]   = useState(false);

  const contacts = [
    {
      name: "Florencio Dorrance",
      role: "Market Development Manager",
      avatar: "/professional-man.png",
    },
    {
      name: "Benny Spanbauer",
      role: "Area Sales Manager",
      avatar: "/professional-woman-diverse.png",
    },
    {
      name: "Jamel Eusebia",
      role: "Administrator",
      avatar: "/professional-person.png",
    },
    {
      name: "Lavern Laboy",
      role: "Account Executive",
      avatar: "/professional-woman-diverse.png",
    },
    {
      name: "Alfonzo Schuessler",
      role: "Proposal Writer",
      avatar: "/professional-man.png",
    },
    {
      name: "Daryl Nehls",
      role: "Nursing Assistant",
      avatar: "/professional-person.png",
    },
  ];

  const messages = [
    { id: 1, text: "just ideas for next time", time: "2 mins", isOwn: false },
    { id: 2, text: "I'll be there in 2 mins 😊", time: "2 mins", isOwn: false },
    { id: 3, text: "woohoooo", time: "now", isOwn: true },
    { id: 4, text: "Haha oh man", time: "now", isOwn: true },
    { id: 5, text: "Haha that's terrifying 😂", time: "now", isOwn: true },
    { id: 6, text: "aww", time: "now", isOwn: false },
    { id: 7, text: "omg, this is amazing", time: "now", isOwn: false },
    { id: 8, text: "woohoooo 🔥", time: "now", isOwn: false },
  ];

  return (
    <div className="relative flex flex-col lg:flex-row bg-white lg:h-[600px]">
      {/* Left Sidebar - Contacts (visible on desktop only) */}
      <div className="hidden lg:block lg:w-80 border-r border-gray-200 bg-white">
        {/* Messages Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <Button
              size="icon"
              className="bg-[#E87A3F] hover:bg-[#d96d34] text-white rounded-full h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Input
            placeholder="Search name"
            className="w-full bg-gray-50 border-gray-200 rounded-lg"
          />
        </div>

        {/* Contacts List */}
        <div className="overflow-y-auto">
          {contacts.map((contact, index) => (
            <div
              key={index}
              className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
            >
              <img
                src={contact.avatar || "/placeholder.svg"}
                alt={contact.name}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 text-sm">
                  {contact.name}
                </h3>
                <p className="text-xs text-gray-500">{contact.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src="/professional-woman-seller.png"
                alt="Seller"
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <h3 className="font-medium text-gray-900">Seller_Name_Here</h3>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  <span className="text-xs text-gray-500">Online</span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-[#E87A3F] border-[#E87A3F] hover:bg-[#FEF3EC] bg-transparent rounded-full ml-11"
            >
              <Flag className="h-4 w-4 mr-1" />
              Report Seller
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-4 bg-gray-50 lg:overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.isOwn ? "justify-end" : "justify-start"
                }`}
              >
                {!message.isOwn && (
                  <img
                    src="/professional-woman-seller.png"
                    alt="Seller"
                    className="w-8 h-8 rounded-full mr-2 mt-1"
                  />
                )}
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl ${
                    message.isOwn
                      ? "bg-[#E87A3F] text-white rounded-br-md"
                      : "bg-white text-gray-900 rounded-bl-md border border-gray-200"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
                {message.isOwn && (
                  <img
                    src="/professional-person-user.png"
                    alt="You"
                    className="w-8 h-8 rounded-full ml-2 mt-1"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 bg-white border-b">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-gray-600"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              placeholder="Type a message"
              className="flex-1 bg-gray-50 border-gray-200 rounded-full px-4"
            />
            <Button
              size="icon"
              className="bg-[#E87A3F] hover:bg-[#d96d34] text-white rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Seller Profile (visible on desktop only) */}
      <div className="hidden lg:block lg:w-80 border-l border-gray-200 bg-white">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            About Seller
          </h2>

          {/* Seller Profile */}
          <div className="text-center mb-6">
            <img
              src="/professional-woman-seller.png"
              alt="Seller"
              className="w-20 h-20 rounded-full mx-auto mb-3"
            />
            <h3 className="font-semibold text-gray-900">Seller_Name_Here</h3>
            <p className="text-sm text-gray-500">Cloth Seller</p>
          </div>

          {/* Stats */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#FEF3EC] rounded-full flex items-center justify-center mr-3">
                <div className="w-4 h-4 bg-[#E87A3F] rounded-full"></div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium text-gray-900">June 12 2015</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#FEF3EC] rounded-full flex items-center justify-center mr-3">
                <div className="w-4 h-4 bg-[#E87A3F] rounded-full"></div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ads Posted</p>
                <p className="font-medium text-gray-900">08</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#FEF3EC] rounded-full flex items-center justify-center mr-3">
                <div className="w-4 h-4 bg-[#E87A3F] rounded-full"></div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Ads</p>
                <p className="font-medium text-gray-900">04</p>
              </div>
            </div>
          </div>

          {/* View Profile Button */}
          <Button className="w-full bg-[#FEF3EC] hover:bg-[#fde8d9] text-[#E87A3F] border border-[#FEF3EC] rounded-lg">
            View Seller Profile
          </Button>
        </div>
      </div>

      {/* Floating toggles (mobile & tablet only) */}
      <div className="lg:hidden">
        <button
          aria-label="Open messages"
          onClick={() => setOpenContacts(true)}
          className="fixed bottom-4 left-4 z-40 h-12 w-12 rounded-full bg-[#E87A3F] text-white flex items-center justify-center shadow-lg active:scale-95"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
        <button
          aria-label="Open seller profile"
          onClick={() => setOpenSeller(true)}
          className="fixed bottom-4 right-4 z-40 h-12 w-12 rounded-full bg-[#E87A3F] text-white flex items-center justify-center shadow-lg active:scale-95"
        >
          <UserRound className="h-6 w-6" />
        </button>
      </div>

      {/* Contacts Drawer (left) for mobile & tablet */}
      {openContacts && (
        <>
          <div
            onClick={() => setOpenContacts(false)}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          />
          <div className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85%] bg-white shadow-xl lg:hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  className="bg-[#E87A3F] hover:bg-[#d96d34] text-white rounded-full h-8 w-8"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpenContacts(false)}
                  className="h-8 w-8 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4 border-b border-gray-200">
              <Input
                placeholder="Search name"
                className="w-full bg-gray-50 border-gray-200 rounded-lg"
              />
            </div>
            <div className="overflow-y-auto">
              {contacts.map((contact, index) => (
                <div
                  key={index}
                  className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                >
                  <img
                    src={contact.avatar || "/placeholder.svg"}
                    alt={contact.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">
                      {contact.name}
                    </h3>
                    <p className="text-xs text-gray-500">{contact.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Seller Drawer (right) for mobile & tablet */}
      {openSeller && (
        <>
          <div
            onClick={() => setOpenSeller(false)}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-80 max-w-[85%] bg-white shadow-xl lg:hidden overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                About Seller
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpenSeller(false)}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Seller Profile */}
            <div className="p-6">
              <div className="text-center mb-6">
                <img
                  src="/professional-woman-seller.png"
                  alt="Seller"
                  className="w-20 h-20 rounded-full mx-auto mb-3"
                />
                <h3 className="font-semibold text-gray-900">Seller_Name_Here</h3>
                <p className="text-sm text-gray-500">Cloth Seller</p>
              </div>

              {/* Stats */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[#FEF3EC] rounded-full flex items-center justify-center mr-3">
                    <div className="w-4 h-4 bg-[#E87A3F] rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium text-gray-900">June 12 2015</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[#FEF3EC] rounded-full flex items-center justify-center mr-3">
                    <div className="w-4 h-4 bg-[#E87A3F] rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ads Posted</p>
                    <p className="font-medium text-gray-900">08</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[#FEF3EC] rounded-full flex items-center justify-center mr-3">
                    <div className="w-4 h-4 bg-[#E87A3F] rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active Ads</p>
                    <p className="font-medium text-gray-900">04</p>
                  </div>
                </div>
              </div>

              {/* View Profile Button */}
              <Button className="w-full bg-[#FEF3EC] hover:bg-[#fde8d9] text-[#E87A3F] border border-[#FEF3EC] rounded-lg">
                View Seller Profile
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
