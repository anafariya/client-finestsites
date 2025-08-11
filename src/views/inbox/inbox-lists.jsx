/***
*
*   DASHBOARD
*   Template dashboard example demonstrating various components inside a view.
*
**********/

import { useContext, useEffect, useState, useRef } from 'react';
import { ViewContext, useAPI, Animate, useNavigate, useParams, useTranslation, AuthContext } from 'components/lib';
import { Avatar, AvatarFallback, AvatarImage } from "components/shadcn/avatar";
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { formatRelativeTime } from 'utils/formatRelativesTime';
import { io } from 'socket.io-client';
import Settings from 'settings.json';

export function InboxLists(){

  // context
  const viewContext = useContext(ViewContext);
  const context = useContext(AuthContext);
  let navigate = useNavigate();
  let params = useParams()
  let {t} = useTranslation()
  const [page, setPage] = useState(1);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);
  const conversationsRef = useRef([]);

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [loading]); // Remove observerRef.current from dependencies

  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const res = await axios.get(`/api/inbox?page=${page}&limit=10`);
      setConversations(prev => [...prev, ...res.data.data]);
      setPage(prev => prev + 1);

      if (res.data.data.length < 10) setHasMore(false); // no more pages
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch inbox', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (page === 1) return;
    loadMore();
  }, [page]); // Keep only page as dependency

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations.length]); // Only depend on conversations length, not the entire array

  // socket
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io(Settings[process.env.NODE_ENV].server_url || 'http://localhost:8080', {
      transports: ['websocket'],
      withCredentials: true
    });

    if (context?.user?.user_id) {
      socket.current.emit('join_user_room', context.user.user_id);
    }

    // Listen for incoming message
    socket.current.on('update_inbox', async (data) => {
      const current = conversationsRef.current;
      
      const updatedConv = current.find((conv) => conv.matchId === data.matchId);

      if (updatedConv) {
        const isSameChat = params.id === data.matchId;
        const isFromOtherUser = data.lastMessage.sender_id !== context.user.user_id;

        const isUnread = isFromOtherUser && !isSameChat;

        const newConv = {
          ...updatedConv,
          message: data.lastMessage.text,
          time: data.lastMessage.sent_at,
          unread: isUnread,
        };

        const reordered = [newConv, ...current.filter((conv) => conv.matchId !== data.matchId)];
        setConversations(reordered);
        conversationsRef.current = reordered;

        if (isUnread) {
          context?.getUncomingMessage(1);
        }
      }

    });

    socket.current.on('message_read', (data) => {
      const current = conversationsRef.current;
      if(data.readerId === context.user.user_id){
        const updated = current.map((conv) => {
          if (conv.matchId === data.chatId) {
            return {
              ...conv,
              unread: false, // Mark as read
            };
          }
          return conv;
        });
  
        setConversations(updated);
        conversationsRef.current = updated;
        context.readMessage(1)
      }
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [context?.user?.user_id, params.id]); // Add proper dependencies

  useEffect(() => {
    if (conversationsRef.current && params.id && context?.user?.user_id) {
      const current = conversationsRef.current;

      // Update only the matching conversation's unread flag to false
      const updatedConv = current?.find((conv) => conv.matchId === params.id);
      const isFromOtherUser = updatedConv?.sender_id && (updatedConv?.sender_id?.toString?.() !== context.user.user_id);

      const updated = current.map((conv) =>
        conv.matchId === params.id
          ? { ...conv, unread: (params.id === updatedConv.matchId) && (updatedConv?.sender_id && (updatedConv?.sender_id?.toString?.() !== context.user.user_id)) }
          : conv
      );

      setConversations(updated);
      conversationsRef.current = updated;
      // context.setUnreadRefetch();
    }
  }, [params?.id, context?.user?.user_id]); // Add user_id to dependencies

  return (
    <Animate type="pop" className="w-full">
      <div className="w-full max-w-mds mx-auto bg-white shadow-sm p-4 lg:p-10 h-[450px] lg:h-[100vh] overflow-y-auto overflow-x-hidden">
        <div className="flex items-center gap-3 mb-4 border-b pb-2 sm:h-[70px]">
          <div className="flex flex-col">
            <span className="font-semibold text-xl">{t('inbox.conversation')} &nbsp;
              {context?.unreadCount ? <span>(<span className="font-bold text-green-500">
                {context?.unreadCount}
                </span>)</span> : null}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {conversations?.length ? conversations.map((conv, index) => (
            <div
              key={conv.matchId}
              className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 cursor-pointer ${
                conv.unread ? "font-semibold" : "text-gray-600"
              } ${
                params.id === conv.matchId && 'bg-gray-100'
              }`}
              onClick={() => navigate(`/inbox/${conv.matchId}`)}
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={conv.avatar} alt={conv.name} className="object-cover object-center" />
                  <AvatarFallback>{conv.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span>{conv.name}</span>
                  <span className="text-sm text-gray-500 truncate w-48">
                    {conv.message}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-500">
                  {conv.time && formatRelativeTime(conv.time)}
                </span>
                {conv.unread && <span className="w-2 h-2 rounded-full bg-blue-600 mt-1" />}
              </div>
            </div>
          )) : !loading ? <div
              className={`flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 cursor-pointer`}
            >
              <span className="text-sm text-gray-500 truncate w-48 text-center">
                {t('inbox.empty')}
              </span>
            </div> : null}

          {/* Intersection Observer Target */}
          {hasMore && (
            <div ref={observerRef} className="flex justify-center items-center py-4">
              {loading && <Loader2 className="h-5 w-5 animate-spin text-gray-500" />}
            </div>
          )}
        </div>
      </div>
    </Animate>

  );
}
