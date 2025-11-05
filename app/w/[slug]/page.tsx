'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Heart, Calendar, MapPin, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function WeddingWebsitePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRsvp, setShowRsvp] = useState(false);
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState<'ATTENDING' | 'NOT_ATTENDING' | 'MAYBE'>('ATTENDING');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [slug]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/rsvp/${slug}`);
      const data = await response.json();

      if (data.success) {
        setEvent(data.data);
      } else {
        toast.error(data.message || 'Event not found');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load wedding website');
    } finally {
      setLoading(false);
    }
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/rsvp/${slug}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: rsvpEmail,
          rsvpStatus,
          dietaryRestrictions,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('RSVP submitted successfully!');
        setShowRsvp(false);
        setRsvpEmail('');
        setDietaryRestrictions('');
      } else {
        toast.error(data.message || 'Failed to submit RSVP');
      }
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      toast.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Wedding Not Found</h1>
          <p className="text-gray-600">This wedding website is not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-pink-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <Heart className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-5xl font-bold mb-4">
            {event.partner1Name && event.partner2Name
              ? `${event.partner1Name} & ${event.partner2Name}`
              : event.name}
          </h1>
          <p className="text-2xl mb-8">We're getting married!</p>
          <div className="flex items-center justify-center text-xl">
            <Calendar className="h-6 w-6 mr-2" />
            {new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Calendar className="h-6 w-6 text-pink-600 mr-2" />
                <h3 className="text-xl font-semibold">When</h3>
              </div>
              <p className="text-gray-600">
                {new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              {event.time && (
                <p className="text-gray-600 flex items-center mt-2">
                  <Clock className="h-4 w-4 mr-2" />
                  {event.time}
                </p>
              )}
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <MapPin className="h-6 w-6 text-pink-600 mr-2" />
                <h3 className="text-xl font-semibold">Where</h3>
              </div>
              <p className="text-gray-900 font-medium">{event.venue || 'Venue TBD'}</p>
              {event.venueAddress && (
                <p className="text-gray-600 mt-2">{event.venueAddress}</p>
              )}
            </div>
          </Card>
        </div>

        {/* RSVP Section */}
        <Card className="mb-16">
          <div className="p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">RSVP</h2>
            <p className="text-gray-600 mb-6">
              We would love to celebrate with you! Please let us know if you can make it.
            </p>

            {!showRsvp ? (
              <Button onClick={() => setShowRsvp(true)} size="lg">
                Submit RSVP
              </Button>
            ) : (
              <form onSubmit={handleRsvpSubmit} className="max-w-md mx-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    value={rsvpEmail}
                    onChange={(e) => setRsvpEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="your@email.com"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use the email address from your invitation
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Will you attend? *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="rsvpStatus"
                        value="ATTENDING"
                        checked={rsvpStatus === 'ATTENDING'}
                        onChange={(e) => setRsvpStatus(e.target.value as any)}
                        className="text-pink-600 focus:ring-pink-500"
                      />
                      <span className="ml-3">Yes, I'll be there!</span>
                    </label>

                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="rsvpStatus"
                        value="NOT_ATTENDING"
                        checked={rsvpStatus === 'NOT_ATTENDING'}
                        onChange={(e) => setRsvpStatus(e.target.value as any)}
                        className="text-pink-600 focus:ring-pink-500"
                      />
                      <span className="ml-3">Sorry, can't make it</span>
                    </label>

                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="rsvpStatus"
                        value="MAYBE"
                        checked={rsvpStatus === 'MAYBE'}
                        onChange={(e) => setRsvpStatus(e.target.value as any)}
                        className="text-pink-600 focus:ring-pink-500"
                      />
                      <span className="ml-3">Maybe</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dietary Restrictions
                  </label>
                  <textarea
                    value={dietaryRestrictions}
                    onChange={(e) => setDietaryRestrictions(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    rows={3}
                    placeholder="Please let us know if you have any dietary restrictions..."
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowRsvp(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={submitting} className="flex-1">
                    Submit RSVP
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-4xl mx-auto text-center px-4">
          <Heart className="h-8 w-8 mx-auto mb-4" />
          <p className="text-gray-400">
            Created with WeddingPlanner SaaS
          </p>
        </div>
      </footer>
    </div>
  );
}
