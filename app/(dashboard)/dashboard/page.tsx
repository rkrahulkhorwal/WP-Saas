'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Users, CheckCircle, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const upcomingEvent = events.length > 0 ? events[0] : null;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back! Here's an overview of your wedding planning progress.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      ) : events.length === 0 ? (
        <Card className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Events Yet</h2>
          <p className="text-gray-600 mb-6">Get started by creating your first wedding event!</p>
          <Link href="/dashboard/events">
            <Button>Create Your First Event</Button>
          </Link>
        </Card>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Events"
              value={events.length}
              icon={<Calendar className="h-8 w-8 text-pink-600" />}
              trend="+12%"
            />
            <StatsCard
              title="Total Guests"
              value={upcomingEvent?._count.guests || 0}
              icon={<Users className="h-8 w-8 text-blue-600" />}
            />
            <StatsCard
              title="Tasks Completed"
              value={`${upcomingEvent?._count.tasks || 0}/10`}
              icon={<CheckCircle className="h-8 w-8 text-green-600" />}
              trend="+8%"
            />
            <StatsCard
              title="Budget Status"
              value={upcomingEvent?.budget ? `$${upcomingEvent.budget.toLocaleString()}` : 'Not set'}
              icon={<DollarSign className="h-8 w-8 text-yellow-600" />}
            />
          </div>

          {/* Upcoming Event */}
          {upcomingEvent && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Upcoming Event</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{upcomingEvent.name}</h3>
                    <p className="text-gray-600 mb-4">
                      {new Date(upcomingEvent.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>📍 {upcomingEvent.venue || 'Venue TBD'}</span>
                      <span>👥 {upcomingEvent.guestCount || 0} guests</span>
                    </div>
                  </div>
                  <Link href={`/dashboard/events/${upcomingEvent.id}`}>
                    <Button>View Details</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/dashboard/guests">
                    <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-pink-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">Manage Guests</p>
                          <p className="text-sm text-gray-600">Add or update your guest list</p>
                        </div>
                      </div>
                    </button>
                  </Link>

                  <Link href="/dashboard/tasks">
                    <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-pink-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">View Tasks</p>
                          <p className="text-sm text-gray-600">Check your to-do list</p>
                        </div>
                      </div>
                    </button>
                  </Link>

                  <Link href="/dashboard/budget">
                    <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-pink-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">Track Budget</p>
                          <p className="text-sm text-gray-600">Monitor your expenses</p>
                        </div>
                      </div>
                    </button>
                  </Link>

                  <Link href="/dashboard/vendors">
                    <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
                      <div className="flex items-center">
                        <TrendingUp className="h-5 w-5 text-pink-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">Find Vendors</p>
                          <p className="text-sm text-gray-600">Browse vendor directory</p>
                        </div>
                      </div>
                    </button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Important Reminders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Send Save the Dates</p>
                      <p className="text-sm text-gray-600">Due in 3 days</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Book Photographer</p>
                      <p className="text-sm text-gray-600">High priority</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Venue Deposit Due</p>
                      <p className="text-sm text-gray-600">Due next week</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && <p className="text-sm text-green-600 mt-1">{trend}</p>}
        </div>
        <div>{icon}</div>
      </CardContent>
    </Card>
  );
}
