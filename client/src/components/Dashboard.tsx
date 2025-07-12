import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { skillsAPI, requestsAPI } from '../api';
import { Skill, SkillRequest } from '../types';
import { 
  BookOpen, 
  MessageSquare, 
  TrendingUp, 
  Users,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    mySkills: 0,
    pendingRequests: 0,
    sentRequests: 0,
    completedExchanges: 0,
  });
  const [recentSkills, setRecentSkills] = useState<Skill[]>([]);
  const [recentRequests, setRecentRequests] = useState<SkillRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [mySkills, receivedRequests, sentRequests, allSkills] = await Promise.all([
        skillsAPI.getMySkills(),
        requestsAPI.getReceivedRequests(),
        requestsAPI.getSentRequests(),
        skillsAPI.getSkills()
      ]);

      setStats({
        mySkills: mySkills.length,
        pendingRequests: receivedRequests.filter(r => r.status === 'pending').length,
        sentRequests: sentRequests.filter(r => r.status === 'pending').length,
        completedExchanges: receivedRequests.filter(r => r.status === 'completed').length,
      });

      setRecentSkills(allSkills.slice(0, 5));
      setRecentRequests(receivedRequests.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'My Skills',
      value: stats.mySkills,
      icon: BookOpen,
      color: 'bg-blue-500',
      link: '/my-skills',
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: MessageSquare,
      color: 'bg-yellow-500',
      link: '/requests',
    },
    {
      title: 'Sent Requests',
      value: stats.sentRequests,
      icon: TrendingUp,
      color: 'bg-green-500',
      link: '/requests',
    },
    {
      title: 'Completed Exchanges',
      value: stats.completedExchanges,
      icon: Users,
      color: 'bg-purple-500',
      link: '/requests',
    },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-300 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.full_name || user?.username}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's an overview of your skill exchange activity.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} to={card.link}>
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className={`${card.color} rounded-lg p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Skills */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Skills</h2>
              <Link
                to="/skills"
                className="text-primary-600 hover:text-primary-700 flex items-center text-sm"
              >
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentSkills.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No skills available yet</p>
                <Link
                  to="/skills"
                  className="text-primary-600 hover:text-primary-700 text-sm"
                >
                  Browse available skills
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentSkills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{skill.skill_name}</h3>
                      <p className="text-sm text-gray-600">
                        by {skill.full_name} • {skill.proficiency_level}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {skill.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Requests</h2>
              <Link
                to="/requests"
                className="text-primary-600 hover:text-primary-700 flex items-center text-sm"
              >
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentRequests.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No requests yet</p>
                <Link
                  to="/my-skills"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add your first skill
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{request.requested_skill}</h3>
                      <p className="text-sm text-gray-600">
                        from {request.requester_name} • {request.offered_skill}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;