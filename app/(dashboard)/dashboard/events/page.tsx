'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Plus, MapPin, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/events', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
          <p className="mt-2 text-gray-600">Manage all your wedding events</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Event
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      ) : events.length === 0 ? (
        <Card className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Events Yet</h2>
          <p className="text-gray-600 mb-6">Create your first event to get started!</p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Create Event
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchEvents();
          }}
        />
      )}
    </div>
  );
}

function EventCard({ event }: { event: any }) {
  return (
    <Link href={`/dashboard/events/${event.id}`}>
      <Card className="hover:shadow-lg transition cursor-pointer h-full">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-pink-600" />
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-800 rounded-full">
              {event.type}
            </span>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">{event.name}</h3>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(event.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>

            {event.venue && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {event.venue}
              </div>
            )}

            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              {event._count.guests} guests
            </div>
          </div>

          {event.budget && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">Budget</p>
              <p className="text-lg font-semibold text-gray-900">
                ${event.budget.toLocaleString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function CreateEventModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    venue: '',
    venueAddress: '',
    budget: '',
    guestCount: '',
    partner1Name: '',
    partner2Name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          budget: formData.budget ? parseFloat(formData.budget) : undefined,
          guestCount: formData.guestCount ? parseInt(formData.guestCount) : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Event created successfully!');
        onSuccess();
      } else {
        toast.error(data.message || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="John & Jane's Wedding"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Partner 1 Name
              </label>
              <input
                type="text"
                value={formData.partner1Name}
                onChange={(e) => setFormData({ ...formData, partner1Name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Partner 2 Name
              </label>
              <input
                type="text"
                value={formData.partner2Name}
                onChange={(e) => setFormData({ ...formData, partner2Name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Venue
            </label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Sunset Garden Estate"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Venue Address
            </label>
            <input
              type="text"
              value={formData.venueAddress}
              onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="123 Garden Lane, Los Angeles, CA 90210"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="50000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guest Count
              </label>
              <input
                type="number"
                value={formData.guestCount}
                onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="150"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Create Event
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
