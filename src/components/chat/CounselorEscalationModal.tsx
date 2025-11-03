'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  ExclamationTriangleIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface CounselorEscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToCounselor: (message?: string) => void;
  stressLevel: number;
  conversationSummary: string;
}

export default function CounselorEscalationModal({
  isOpen,
  onClose,
  onSendToCounselor,
  stressLevel,
  conversationSummary
}: CounselorEscalationModalProps) {
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendToCounselor = async () => {
    setSending(true);
    try {
      await onSendToCounselor(customMessage || conversationSummary);
      onClose();
    } finally {
      setSending(false);
    }
  };

  const getUrgencyLevel = () => {
    if (stressLevel >= 80) return { level: 'High', color: 'red', icon: '🚨' };
    if (stressLevel >= 60) return { level: 'Medium', color: 'orange', icon: '⚠️' };
    return { level: 'Low', color: 'yellow', icon: '💛' };
  };

  const urgency = getUrgencyLevel();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-md p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl bg-${urgency.color}-100`}>
                      <ExclamationTriangleIcon className={`w-6 h-6 text-${urgency.color}-600`} />
                    </div>
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-semibold text-warm-gray-900"
                      >
                        Need additional support?
                      </Dialog.Title>
                      <p className="text-sm text-warm-gray-600">
                        {urgency.icon} Stress level: {urgency.level}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1 text-warm-gray-400 hover:text-warm-gray-600 rounded-lg"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <div className="bg-warm-gray-50 rounded-lg p-4">
                    <p className="text-sm text-warm-gray-700 mb-2">
                      Based on our conversation, it seems like you might benefit from speaking with a counselor. 
                      Would you like me to share a summary of our chat with your counselor?
                    </p>
                    <div className="text-xs text-warm-gray-500">
                      This will help them understand your current situation better.
                    </div>
                  </div>

                  {/* Conversation summary preview */}
                  <div className="bg-soft-blue-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-soft-blue-900 mb-2">
                      Conversation Summary:
                    </h4>
                    <p className="text-xs text-soft-blue-800 line-clamp-3">
                      {conversationSummary}
                    </p>
                  </div>

                  {/* Custom message */}
                  <div>
                    <label className="block text-sm font-medium text-warm-gray-700 mb-2">
                      Add a personal note (optional):
                    </label>
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Anything specific you'd like your counselor to know..."
                      className="
                        w-full p-3 border border-sage-200 rounded-lg
                        focus:ring-2 focus:ring-soft-blue-500 focus:border-soft-blue-500
                        text-sm resize-none
                      "
                      rows={3}
                      maxLength={500}
                    />
                    <div className="text-xs text-warm-gray-500 mt-1">
                      {customMessage.length}/500 characters
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-3 mt-6">
                  {/* Send to counselor */}
                  <button
                    onClick={handleSendToCounselor}
                    disabled={sending}
                    className="
                      flex items-center justify-center space-x-2 w-full px-4 py-3
                      bg-soft-blue-500 hover:bg-soft-blue-600 disabled:bg-soft-blue-300
                      text-white rounded-xl font-medium
                      transition-colors duration-200
                    "
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    <span>
                      {sending ? 'Sending to counselor...' : 'Send to counselor'}
                    </span>
                  </button>

                  {/* Crisis hotline */}
                  <a
                    href="tel:+91-123-456-7890"
                    className="
                      flex items-center justify-center space-x-2 w-full px-4 py-3
                      bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium
                      transition-colors duration-200
                    "
                  >
                    <PhoneIcon className="w-4 h-4" />
                    <span>Call crisis hotline now</span>
                  </a>

                  {/* Not now */}
                  <button
                    onClick={onClose}
                    className="
                      w-full px-4 py-3 text-warm-gray-600 hover:text-warm-gray-800
                      bg-warm-gray-100 hover:bg-warm-gray-200 rounded-xl font-medium
                      transition-colors duration-200
                    "
                  >
                    Not right now
                  </button>
                </div>

                {/* Privacy note */}
                <div className="mt-4 pt-4 border-t border-warm-gray-200">
                  <p className="text-xs text-warm-gray-500 text-center">
                    🔒 Your conversation will be shared confidentially with licensed counselors only.
                    You maintain full control over your mental health support.
                  </p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}