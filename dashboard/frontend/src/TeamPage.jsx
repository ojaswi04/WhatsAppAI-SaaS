import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Linkedin, Twitter, Mail, ArrowLeft } from 'lucide-react';
import { supabase } from './auth';

// Expected Supabase table: `team_members`
//   id            uuid / int, primary key
//   name          text, not null
//   role          text, not null
//   bio           text, nullable
//   photo_url     text, nullable
//   linkedin_url  text, nullable
//   twitter_url   text, nullable
//   email         text, nullable
//   display_order int, nullable (used to sort; falls back to name)
//
// This page is public (unauthenticated), so `team_members` needs a Supabase
// RLS policy that allows public SELECT, e.g.:
//   create policy "Public can read team members"
//   on team_members for select
//   using (true);
function useTeamMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchTeam() {
      setLoading(true);
      setError('');
      try {
        const { data, error: supabaseError } = await supabase
          .from('team_members')
          .select('*')
          .order('display_order', { ascending: true, nullsFirst: false });

        if (supabaseError) throw supabaseError;
        if (!cancelled) setMembers(data || []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load team members');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTeam();
    return () => {
      cancelled = true;
    };
  }, []);

  return { members, loading, error };
}

function initials(name = '') {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function MemberCard({ member }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 flex flex-col items-center text-center">
      {member.photo_url ? (
        <img
          src={member.photo_url}
          alt={member.name}
          className="w-20 h-20 rounded-full object-cover mb-4"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 flex items-center justify-center font-semibold text-lg mb-4">
          {initials(member.name)}
        </div>
      )}
      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{member.name}</h3>
      <p className="text-sm text-green-700 dark:text-green-400 font-medium">{member.role}</p>
      {member.bio && <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">{member.bio}</p>}
      <div className="flex items-center gap-3 mt-4">
        {member.linkedin_url && (
          <a href={member.linkedin_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <Linkedin size={18} />
          </a>
        )}
        {member.twitter_url && (
          <a href={member.twitter_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <Twitter size={18} />
          </a>
        )}
        {member.email && (
          <a href={`mailto:${member.email}`} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <Mail size={18} />
          </a>
        )}
      </div>
    </div>
  );
}

export default function TeamPage() {
  const navigate = useNavigate();
  const { members, loading, error } = useTeamMembers();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <nav className="px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to home
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm">
            W
          </div>
          <span className="font-semibold text-lg tracking-tight text-gray-900 dark:text-gray-100">WhatsappAI</span>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-4">Meet the team</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          The people building your AI employee for WhatsApp.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-50 dark:bg-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              We couldn't load the team right now. Please check back shortly.
            </p>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Team profiles are coming soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-gray-100 dark:border-gray-800 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} WhatsappAI. All rights reserved.
      </footer>
    </div>
  );
}
