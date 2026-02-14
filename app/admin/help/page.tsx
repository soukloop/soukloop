"use client";

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HelpLinePage() {
    const [showContactForm, setShowContactForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: API call to send message
        console.log('Submit helpline message:', formData);
        setFormData({ name: '', email: '', message: '' });
        alert('Message sent successfully!');
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <div className="mb-2 flex items-center text-sm text-gray-500">
                    <span>Admin Dashboard</span>
                    <span className="mx-2">›</span>
                    <span className="text-gray-900">Help Line</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Help Line</h1>
                <p className="text-gray-600">Contact support and access help resources.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Contact Methods */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Contact Methods</h2>

                    <div className="rounded-xl border bg-white p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                                <img src="/call-icon.png" alt="Phone" className="h-6 w-6" onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Phone Support</h3>
                                <p className="text-gray-600">+1 (555) 000-0000</p>
                                <p className="text-sm text-gray-500">Available 9 AM - 6 PM EST</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                <img src="/tooltip-icon.png" alt="Chat" className="h-6 w-6" onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Live Chat</h3>
                                <p className="text-gray-600">Chat with our support team</p>
                                <Button
                                    variant="link"
                                    className="h-auto p-0 text-orange-500"
                                    onClick={() => console.log('Open live chat')}
                                >
                                    Start Chat →
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                <img src="/mail-icon.png" alt="Email" className="h-6 w-6" onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Email Support</h3>
                                <p className="text-gray-600">support@soukloop.com</p>
                                <p className="text-sm text-gray-500">Response within 24 hours</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="rounded-xl border bg-white p-6">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">Send a Message</h2>
                    <p className="mb-6 text-gray-600">
                        Whether it's about your order, a product, or selling on Soukloop — we're just a message away.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                placeholder="Enter your name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                placeholder="Type your message..."
                                rows={5}
                                required
                            />
                        </div>
                        <div className="text-sm text-gray-600">
                            By submitting, you agree to our{' '}
                            <span className="cursor-pointer text-orange-500 underline">Terms of Use</span>
                            {' '}and{' '}
                            <span className="cursor-pointer text-orange-500 underline">Privacy Policy</span>
                        </div>
                        <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                            Submit Message
                        </Button>
                    </form>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="rounded-xl border bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {[
                        { q: 'How do I reset my admin password?', a: 'Go to Settings > Profile > Change Password' },
                        { q: 'How do I approve a seller?', a: 'Navigate to Seller Verification, select the seller, and click Approve' },
                        { q: 'Where can I view transaction reports?', a: 'Go to Transactions & Payouts for detailed reports' },
                    ].map((faq, index) => (
                        <div key={index} className="rounded-lg border p-4">
                            <p className="font-medium text-gray-900">{faq.q}</p>
                            <p className="mt-1 text-sm text-gray-600">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
