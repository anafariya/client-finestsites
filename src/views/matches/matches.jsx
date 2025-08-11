import React, { useContext, useEffect, useState } from "react";
import axios from 'axios';
import { Card, CardContent } from "components/shadcn/card";
import { Avatar, AvatarImage, AvatarFallback } from "components/shadcn/avatar";
import { MessageCircleHeart, UnlockKeyholeIcon } from "lucide-react";
import { useNavigate, useTranslation, ViewContext, AuthContext } from 'components/lib';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "components/shadcn/pagination";

const Matches = () => {
  const router = useNavigate();
  const viewContext = useContext(ViewContext);
  const context = useContext(AuthContext);
  const { t } = useTranslation();
  const [matchesData, setMatchesData] = useState([]);
  const [unmatchedData, setUnmatchedData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [pageUnmatched, setPageUnmatched] = useState(1);
  const [totalUnmatchedPages, setTotalUnmatchedPages] = useState(1);
  const limit = 15;

  useEffect(() => {
    fetchMatches();
  }, [page]);

  useEffect(() => {
    fetchUnmatched();
  }, [pageUnmatched]);

  function formatDateString(d) {
    const formatter = new Intl.DateTimeFormat('de-DE', {
      timeZone: 'Europe/Berlin',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(new Date(d));
  }

  const fetchMatches = async () => {
    try {
      const res = await axios.get(`/api/matching/matches?page=${page}&limit=${limit}`);
      setMatchesData(res.data.data || []);
      setTotalPages(res.data.totalPages || null);
    } catch (err) {
      console.error('Failed to fetch matches', err);
    }
  };

  const fetchUnmatched = async () => {
    try {
      const res = await axios.get(`/api/matching/unmatched?page=${pageUnmatched}&limit=${limit}`);
      setUnmatchedData(res.data.data || []);
      setTotalUnmatchedPages(res.data.totalPages || null);
    } catch (err) {
      console.error('Failed to fetch unmatched', err);
    }
  };

  const unlockChat = (id, eventId) => {
    viewContext.dialog.open({
      title: t('matches.unlock_chat'),
      description: t('matches.unlock_question'),
      form: {
        inputs: {
          targetId: {
            type: 'hidden',
            value: id,
          },
          eventId: {
            type: 'hidden',
            value: eventId,
          }
        },
        url: '/api/matching/unlock-chat',
        method: 'POST',
        buttonText: t('matches.unlock'),
      }
    }, () => {
      fetchMatches()
      fetchUnmatched()
      const user = JSON.parse(localStorage.getItem('user'));

      if (user && Array.isArray(user.accounts) && user.accounts[0]) {
        const currentVC = user.accounts[0].virtual_currency || 0;
        const updatedVC = currentVC - 100;

        context.update({
          accounts: [
            {
              ...user.accounts[0],
              virtual_currency: updatedVC
            }
          ]
        });
      }
    });
  };

  return (
    <div className="p-4 lg:p-10 space-y-12">
      {/* Matches */}
      <section>
        <h2 className="text-xl font-bold mb-4">{t('matches.discover_your_matches')}</h2>
        <Card className="rounded-xl shadow-sm p-0">
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full table-auto text-sm">
              <thead className="text-gray-500 text-left bg-gray-100">
                <tr>
                  <th className="py-4 px-6">{t('matches.your_match')}</th>
                  <th className="py-4 px-6">{t('matches.participated_in')}</th>
                  <th className="py-4 px-6">{t('matches.participated_on')}</th>
                  <th className="py-4 px-6">{t('matches.go_to_chat')}</th>
                </tr>
              </thead>
              <tbody>
                {matchesData?.length ? matchesData.map((user) => (
                  <tr key={user.id} className="border-t border-gray-100 hover:bg-slate-50">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} className="object-center object-cover" />
                        <AvatarFallback>{user.name?.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">{user.name}</span>
                        <button
                          className="text-xs text-blue-500 hover:underline hover:text-blue-400 text-left"
                          onClick={() => router(`/profile/${user._id}`)}
                        >{t('matches.open_profile')}</button>
                      </div>
                    </td>
                    <td className="py-4 px-6">{user.city}</td>
                    <td className="py-4 px-6">{user.eventDate && formatDateString(user.eventDate)}</td>
                    <td className="py-4 px-6">
                      <button
                        className="text-pink-500 hover:underline flex flex-row gap-2 items-center"
                        onClick={() => router(`/inbox/${user.chat_id}`)}
                      >
                        <MessageCircleHeart /> {t('matches.open_chat')}
                      </button>
                    </td>
                  </tr>
                )) : <tr className="border-t border-gray-100 hover:bg-slate-50">
                  <td className="py-4 px-6" colSpan={4}>
                    <div className="flex items-center justify-center text-gray-500">
                      <span className="font-medium">{t('matches.empty')}</span>
                    </div>
                  </td>
                </tr>}
              </tbody>
            </table>
          </CardContent>
          {
            matchesData?.length ?
            <Pagination className="my-4 justify-end lg:pr-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={page === i + 1}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination> : null
          }
        </Card>
      </section>

      {/* Unlock Chats */}
      <section>
        <h2 className="text-xl font-bold mb-4">{t('matches.unlock_header')}</h2>
        <Card className="rounded-xl shadow-sm p-0">
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full table-auto text-sm">
              <thead className="text-gray-500 text-left bg-gray-100">
                <tr>
                  <th className="py-4 px-6">{t('matches.person')}</th>
                  <th className="py-4 px-6">{t('matches.participated_in')}</th>
                  <th className="py-4 px-6">{t('matches.participated_on')}</th>
                  <th className="py-4 px-6">{t('matches.unlock_chat')}</th>
                </tr>
              </thead>
              <tbody>
                {unmatchedData?.length ? unmatchedData.map((user) => (
                  <tr key={user.id} className="border-t border-gray-100 hover:bg-slate-50">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} className="object-center object-cover"  />
                        <AvatarFallback>{user.name?.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">{user.name}</span>
                        <button
                          className="text-xs text-blue-500 hover:underline hover:text-blue-400 text-left"
                          onClick={() => router(`/profile/${user._id}`)}
                        >{t('matches.open_profile')}</button>
                      </div>
                    </td>
                    <td className="py-4 px-6">{user.city}</td>
                    <td className="py-4 px-6">{user.eventDate && formatDateString(user.eventDate)}</td>
                    <td className="py-4 px-6">
                      <button className="text-blue-500 hover:underline flex flex-row gap-2 items-center" onClick={() => unlockChat(user._id, user.event_id)}>
                        <UnlockKeyholeIcon /> {t('matches.unlock_chat')}
                      </button>
                    </td>
                  </tr>
                )) : <tr className="border-t border-gray-100 hover:bg-slate-50">
                  <td className="py-4 px-6" colSpan={4}>
                    <div className="flex items-center justify-center text-gray-500">
                      <span className="font-medium">{t('matches.empty')}</span>
                    </div>
                  </td>
                </tr>}
              </tbody>
            </table>
          </CardContent>
          {
            unmatchedData?.length ?
            <Pagination className="my-4 justify-end lg:pr-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPageUnmatched((p) => Math.max(p - 1, 1))}
                    className={pageUnmatched === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                {[...Array(totalUnmatchedPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={pageUnmatched === i + 1}
                      onClick={() => setPageUnmatched(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPageUnmatched((p) => Math.min(p + 1, totalUnmatchedPages))}
                    className={pageUnmatched === totalUnmatchedPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination> : null
          }
        </Card>
      </section>
    </div>
  );
};

export default Matches;
