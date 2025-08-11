/***
*
*   DASHBOARD
*   Template dashboard example demonstrating various components inside a view.
*
**********/

import { useContext, useEffect, useState, useRef } from 'react';
import { ViewContext, Stat, Chart, Table, Grid, Row, Animate, Feedback, useAPI, Image, useNavigate, useTranslation, useLocation, AuthContext } from 'components/lib';
import { Avatar, AvatarFallback, AvatarImage } from "components/shadcn/avatar";
import { Input } from "components/shadcn/input";
import { Button } from "components/shadcn/button";
import { ScrollArea } from "components/shadcn/scroll-area";
import { DownloadCloudIcon, MailIcon } from "lucide-react";
import { Badge } from "components/shadcn/badge";
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import { cn } from "utils/cn";
import axios from 'axios';
import { formatRelativeTime } from 'utils/formatRelativesTime';
import { io } from 'socket.io-client';
import Settings from 'settings.json';

export function InboxDetail(){
  const location = useLocation();
  const parts = location.pathname.split('/');
  let {t} = useTranslation()
  // context
  const viewContext = useContext(ViewContext);
  const authContext = useContext(AuthContext);
  const router = useNavigate();
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({ top: 0, left: 0 });

  const emojiButtonRef = useRef(null);

  const fileInputRef = useRef(null);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [modalImage, setModalImage] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});

  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const chatId = parts[2]; // Get from URL or state
  const topRef = useRef(null);

  // socket
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io(Settings[process.env.NODE_ENV].server_url || 'http://localhost:8080', {
      transports: ['websocket'],
      withCredentials: true
    });

    // Join room (per chat)
    if (chatId) {
      socket.current.emit('join_room', chatId);
    }

    // Listen for incoming message
    socket.current.on('new_message', async (data) => {
      console.log(data, authContext?.user, 'new msg');
      
      if (data.chatId === chatId) {
        if(authContext?.user?.user_id !== data.message.sender_id){
          setMessages(prev => [...prev, { ...data.message, sender: 'other' }]);
          try {
            await axios.put(`/api/inbox/read/${chatId}`);
          } catch (err) {
            console.error('Failed to fetch message', err);
          }
        }
      } else {
        authContext.getUncomingMessage(1)
      }
    });

    return () => {
      if (socket.current) {
        socket.current.emit('leave_room', chatId); // optional cleanup
        socket.current.disconnect();
      }
    };
  }, [chatId, authContext?.user?.user_id]); // Add user_id to dependencies

  useEffect(() => {
    if (!chatId) return;

    setMessages([]);
    setHasMore(true);
    setLoading(false);

    // Load the first page
    loadMoreMessages();
    // authContext?.setUnreadRefetch()
  }, [chatId]); // Keep only chatId as dependency

  useEffect(() => {
    if (!chatId || !topRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const before = messages?.[0]?.sent_at;
          loadMoreMessages(before);
        }
      },
      { root: null, rootMargin: '0px', threshold: 1.0 }
    );

    observer.observe(topRef.current);

    return () => {
      if (topRef.current) observer.unobserve(topRef.current);
      observer.disconnect();
    };
  }, [chatId, hasMore, loading, messages.length]); // Add messages.length to prevent stale closure

  const loadMoreMessages = async (before = null) => {
  if (!chatId || loading) return;
  setLoading(true);

  try {
    const res = await axios.get(
      `/api/inbox/${chatId}?limit=20${before ? `&before=${before}` : ''}`
    );

    const { data, hasMore: more } = res.data;
    setMessages((prev) => [...data, ...prev]);
    setHasMore(more);
  } catch (err) {
    console.error('Failed to fetch message', err);
  } finally {
    setLoading(false);
  }
};


  const getUserProfile = async () => {
    try {
      const res = await axios.get(`/api/inbox/user/${chatId}`);
      setSelectedUser(res.data.user)
    } catch (err) {
      console.error('Failed to fetch message', err);
    }
  };

  useEffect(() => {
    if (chatId) {
      getUserProfile()
    }
  }, [chatId]); // Keep only chatId as dependency

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages.length]); // Only depend on messages length, not the entire messages array

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    // const file = e.target.files?.[0];
    // if (file) {
    //   const url = URL.createObjectURL(file);
    //   setPreviewUrl(url);
    //   setSelectedFile(file);
    // }
    const files = Array.from(e.target.files || []);
    const urls = files.map((file) => URL.createObjectURL(file));
    setSelectedFiles((prev) => [...prev, ...files]);
    setPreviewUrls((prev) => [...prev, ...urls]);
  };

  const clearImage = () => {
    // setPreviewUrl(null);
    // setSelectedFile(null);
    // if (fileInputRef.current) {
    //   fileInputRef.current.value = '';
    // }
    setSelectedFiles([]);
    setPreviewUrls([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    const newFiles = [...selectedFiles];
    const newUrls = [...previewUrls];
    newFiles.splice(index, 1);
    newUrls.splice(index, 1);
    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };
  

  const toggleEmojiPicker = () => {
    if (!emojiButtonRef.current) return;
    const rect = emojiButtonRef.current.getBoundingClientRect();
    
    setEmojiPickerPosition({ top: rect.top - 440, left: rect.left });
    setShowEmojiPicker((prev) => !prev);
  };

  const getImageOrientation = (file) => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        resolve(img.height > img.width); // isPortrait
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const sendMessage = async () => {
    if (!input.trim() && selectedFiles.length === 0) return;

    setIsSending(true); // ⏳ Start spinner

    const formData = new FormData();
    formData.append('text', input);
    selectedFiles.forEach((file) => formData.append('images', file));

    try {
      const res = await axios.post(`/api/inbox/${chatId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newMessage = res.data.message;
      const imageData = await Promise.all(
        selectedFiles.map(async (file) => {
          const isPortrait = await getImageOrientation(file);
          return {
            url: URL.createObjectURL(file),
            isPortrait,
          };
        })
      );

      setMessages((prev) => [
        ...prev,
        {
          ...newMessage,
          sender: 'self',
          images: imageData,
          text: input
        },
      ]);

      setInput('');
      clearImage();
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setIsSending(false); // ✅ Done
    }
  };

  const getImageOrientationFromUrl = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.height > img.width);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  const checkImageOrientation = (url) => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const isPortrait = img.height > img.width;
        resolve({ url, isPortrait });
      };
      img.onerror = () => resolve({ url, isPortrait: false }); // fallback
      img.src = url;
    });
  };
  
  useEffect(() => {
    const loadOrientations = async () => {
      const updatedMessages = await Promise.all(
        messages.map(async (msg) => {
          if (!msg.images || typeof msg.images[0] !== "string") return msg;
  
          const orientedImages = await Promise.all(
            msg.images.map((url) => checkImageOrientation(url))
          );
  
          return {
            ...msg,
            images: orientedImages,
          };
        })
      );
      setMessages(updatedMessages);
    };
  
    if (messages.length > 0) {
      loadOrientations();
    }
  }, [messages.length]); // Only run when messages array length changes

  const blockUser = (id) => {
    viewContext.dialog.open({
      title: t('inbox.block'),
      description: t('inbox.block_description'),
      form: { 
        inputs: {
          reason: {
            label: t('inbox.reason'),
            type: 'textarea',
            value: '',
          }
        },
        url: `/api/inbox/block/${chatId}`,
        destructive: true,
        method: 'PUT',
        buttonText: t('inbox.block_btn'),
      }
    }, () => {
      setSelectedUser(prev => {
        return {
          ...prev,
          is_blocked: true
        }
      })
    });
  }

  const downloadImage = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      // Set a default name or parse from content-disposition
      const fileName = `chat-${Date.now()}.jpg`;

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download image', err);
    }
  };
  
  return (
    <Animate type='pop' className="w-full flex-1 col-span-2 ">
      <div className="w-full mx-auto bg-white shadow p-4 lg:p-10 flex flex-col h-[100vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 border-b pb-2 sm:h-[70px]">
          <div className="relative cursor-pointer" onClick={() => setShowProfile(true)}>
            <Avatar>
              <AvatarImage src={selectedUser?.avatar} alt="Sender" className="object-cover object-center" />
              <AvatarFallback>{ (selectedUser?.first_name || selectedUser?.name)?.charAt(0) }</AvatarFallback>
            </Avatar>
            {/* <span className="absolute bottom-0 right-0 block w-3 h-3 rounded-full bg-green-500 border-2 border-white" /> */}
          </div>
          <div className="flex flex-col cursor-pointer" onClick={() => setShowProfile(true)}>
            <span className="font-semibold">{selectedUser?.first_name ? `${selectedUser?.first_name} ${ selectedUser?.last_name}` : selectedUser?.name}</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="w-full flex justify-center items-center">
            {/* <span className="text-xs text-gray-400">{messages?.[0]?.time}</span> */}
          </div>
          <div ref={topRef} className="h-px" />
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-end ${
                msg.sender === "self" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "other" && (
                <Avatar className="mr-2 mb-7">
                  <AvatarImage src={ selectedUser?.avatar } 
                    alt="Sender" className="object-cover object-center" />
                  <AvatarFallback>{ (selectedUser?.first_name || selectedUser?.name)?.charAt(0) }</AvatarFallback>
                </Avatar>
              )}
              <div className={`flex flex-col gap-2 ${
                msg.sender === "self" ? "justify-end items-end" : "justify-start items-start"
              }`}>
                {msg.images?.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 max-w-[300px]">
                    {msg.images.map((img, idx) => {
                      const isLast = idx === msg.images.length - 1;
                      const isOnly = msg.images.length === 1;
                      const isOddCount = msg.images.length % 2 !== 0;

                      // Count how many cells each image takes (landscape: 1, portrait: 2 rows)
                      const portraitCount = msg.images.filter(i => i.isPortrait).length;
                      const totalSpans = msg.images.reduce(
                        (sum, i) => sum + (i.isPortrait ? 2 : 1),
                        0
                      );

                      // Move the last image to col-start-2 if it's the only one in its row
                      const moveToRight = isLast && totalSpans % 2 !== 0 && !isOnly;

                      return (
                        <div
                          key={idx}
                          className={`relative rounded-lg border overflow-hidden cursor-pointer
                            ${img.isPortrait ? 'row-span-2' : ''}
                            ${isOnly ? 'col-span-2' : ''}
                            ${moveToRight ? 'col-span-2' : ''}
                          `}
                          onClick={() => setModalImage(img.url || img)}
                        >
                          <Image
                            src={img.url || img}
                            alt={`msg image ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
                {
                  msg.text &&
                  <div
                    className={`rounded-xl px-4 py-2 max-w-xs whitespace-pre-wrap ${
                      msg.sender === "self"
                        ? "bg-violet-600 text-white rounded-br-none"
                        : "bg-gray-100 text-gray-900 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                }
                  <div className="col-span-2 text-xs text-gray-500 text-center mt-1">
                    {msg.sent_at ? formatRelativeTime(msg.sent_at) : ''}
                  </div>
              </div>
              {msg.sender === "self" && (
                <Avatar className="ml-2 mb-7">
                  <AvatarImage src={ authContext?.user?.avatar } 
                    alt="Sender" className="object-cover object-center" />
                  <AvatarFallback>{ authContext?.user?.name?.charAt(0) }</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Textarea */}
        { !selectedUser?.is_blocked && <div className="">
          {showEmojiPicker && (
            <div style={{ position: 'absolute', top: emojiPickerPosition.top, left: emojiPickerPosition.left, zIndex: 50 }}>
              <Picker
                onSelect={(emoji) => {
                  setInput((prev) => prev + emoji.native);
                  setShowEmojiPicker(false);
                }}
                theme="light"
              />
            </div>
          )}
          <div
            className={cn(
              'relative mt-6 flex w-full flex-col items-ends rounded-[12px] border bg-subtle px-4 pb-14 pt-2',
              // isFocused && 'border-slate-500'
            )}
          >
            {/* Preview */}
            {previewUrls.length > 0 && (
              <div className="mb-4 grid grid-cols-3 gap-2 max-w-full">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative w-full rounded-lg border overflow-hidden">
                    <Image
                      src={url}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-[100px] object-cover"
                      onClick={() => setModalImage(url)}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 text-xs size-5 rounded-full"
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {/* {previewUrl && (
              <div>
                <div className="relative w-40 rounded-lg border overflow-hidden">
                  <Image
                    src={previewUrl}
                    alt="Image preview"
                    className="w-full object-cover object-center"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={clearImage}
                    className="absolute top-1 right-1 p-1 text-xs size-5 rounded-full"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            )} */}
            <textarea
              className="max-h-[384px] min-h-[42px] rounded-[10px] border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-transparent focus-visible:outline-none"
              // ref={textareaRef}
              onChange={(e) => setInput(e.target.value)}
              // onFocus={() => setIsFocused(true)} // Set focus state to true
              // onBlur={() => setIsFocused(false)} // Set focus state to false
              // onKeyDown={handleKeyDown}
              value={input}
              placeholder={t('inbox.type_message')}
            />
            <div className="absolute bottom-0 left-0 flex justify-between w-full p-2">
              <div className="flex flex-row gap-1">
                {/* <Button variant="ghost" size="icon">➕</Button> */}
                <Button ref={emojiButtonRef} variant="ghost" size="icon" onClick={toggleEmojiPicker} className="hidden xl:block">😊</Button>
                <div>
                  <Button variant="ghost" size="icon" onClick={handleButtonClick}>
                    📎
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
              <div className="px-2">
                <Button
                  variant="outline"
                  className={cn(
                    'bg-violet-600 text-white',
                    // value !== '' && '!bg-white text-black',
                    // value === '' && 'pointer-events-none'
                  )}
                  onClick={sendMessage}
                  disabled={isSending}
                >
                  {isSending ? (
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    '➤'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div> }
      </div>
      {/* Image Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={() => setModalImage(null)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadImage(modalImage);
            }}
            className="absolute top-3 right-4 bg-white text-sm px-3 py-2 rounded shadow text-green-600 font-semibold"
          >
            <DownloadCloudIcon className="inline-block pr-2" />
            {t('account.profile.receipts.download')}
          </button>
          <div
            className="relative max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()} // prevent modal close on image click
          >
            <img
              src={modalImage}
              alt="Full preview"
              className="max-h-[80vh] w-auto rounded-lg object-contain"
            />
            
          </div>
        </div>
      )}
      
      {showProfile && selectedUser && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-pink-50 shadow-2xl p-4 sm:rounded-l-[2rem] overflow-y-auto sm:max-w-xs md:max-w-sm transition-all border-l border-pink-100">
          <div className="relative flex flex-col items-center text-center p-6">
            <button
              onClick={() => setShowProfile(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-base"
            >
              ✕
            </button>
        
            {/* Profile Image */}
            <div className="relative mb-4 mt-6">
              <div className="w-60 h-60 rounded-full overflow-hidden ring-4 ring-pink-200 shadow-md">
                <img
                  src={selectedUser?.avatar || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARMAAAC3CAMAAAAGjUrGAAAAMFBMVEXx8/XCy9K/yND09vfw8vTP1tzp7O/i5ure4+fO1dvJ0dfT2d/EzNPt7/Lb4OXo6+4FeM7UAAAFL0lEQVR4nO2c24KrIAxFLdha7///t0dxOlWDSiAKztnrbR4G6SoJBKHZA6zJYncgQeCEAicUOKHACQVOKHBCgRMKnFDghAInFDihwAkFTihwQoETCpxQ4IQCJxQ4ocAJBU4ocEKBEwqcUOCEAicUOKHACQVOKHBCgRMKnFDghAInFDihwAkFTihwQoETCpxQ4IQCJxQ4ocAJBU4ot3Oi1KMq64FnWTVq+EueWzlRquqKVn/J+/ezEfdyHydKPYtc62yF1m1Xymq5ixPVdDnx8eslf1eCVu7hRFXFppAfLW39kNJyByeqOTJirGTvRsbKDZyozsHIpKUQsZK8E1Vu55GTrKTuRL0ZRoyVLviZaTtRVctUMuaVOnCoJO1E1WwjxsorbGZO2Qk7br5WuhApKTvpfZWMy5WAoZKuk6b1NhI4VJJ10uRBSsas0ng+OlUnVaARw9NvqCTqRERJpt9eUtJ0IqPEN36SdNIIKRnIPeafFJ0Ep9c5mr+qTdFJ2CRMpLAn5fScqJeokrFWZkoRdaImwtpw2T9iSnnxuiDoRFXda6hK28JzWTA14ryBxKFlTT9iTlT1W57o3Lta96yED8krRieknCw/DDuEP1TnKBlgzMlCTtZDXr+8pIjOwitK5x7JOKFD3mukiE85ix45S5FxYll46prdiv8ekpsU19wv4kS9LV1ouQPlrPzKliIzTuw9YDYiVfgFSxFx8rR+wcyMomSX9HYpTjlFwonqrB3gBc/JyYQjRcRJYe8Ay4l9rMlLcVi8iTjp7Y/nOBHcMjngWEoi4+TUlcmKw9rnxHzCWMqeU/ltkB9JEZl3SusnYmwQn1fm2GgPeiOzZrM9WZfu/3/BNDznYATLOLENffep+JppeMZBMSZUF9N6ljFM7KF3qpTduBZyQj4W53XTiRsEm1L2dr2k9k9W9Rtjq2BrJj9Zyk7pI7bP9lw8kfH+4KIFLGF77Sa3R90Un0POvHNCcYzsLVMk9+2buni1bd9xjMSJHMPmjCz7zov/fidW5GQ7OS/2e8BoRrLtrBfXScTIMVLsk09cJxEjZ8I6+cR1EmG1tsRaDsZ0EjlyDL0leuxOpulD4JTALtfXORRbnqVO1LDOePdtpoclWPsqulL+wt0P0SNnxFKrrp2opmuXl+5OuHA3PSmByDGQ9ezSydYdM+ELd4YUIsdANnoWTva2RSUv3JlnJRE5I2RbY+6kee1+dTrrhC7cPTZeMUdivZnydaIc3tdqqWuI6USOYZlSfp0oxzVlJxNByUSOYZlSPk6cDzqEXy17JDTn/LBMKRlTSRZ4X2giep2zZnEwZHLiGjifFt6BTtKKHMMspUxO2BkvDzoDm1jkGGa7bsaJx0t9XfgrOfuMlhezwsc48RrKufvhyiXXHatg8T2Zkm0eHzluxO8W4pXHKljkXycBt3h9blFdeqyCx2fPOguLbn6qTWsBu+Czxs/CopsdP4kmkx+mcZ8FRrfuWUqSTSYT005keDucW4iXnzRhMg17iYacC6A0VyZzzIQs0pBrUrn22JoXY4Us0pDjaZMzb+dIMX6/Qi0dHSU0XHySz48heqSaOs60vsvlq2mtpzj9OCh/Trgjew7afgLar63d6ec2SmTZm37+UyV7048K+Gmkm7O10A/8aaSbY7sEr8rYvYoNnX4Sr3EuYJVpVc35Ccu/innZbryMJ1n4v9f4N9FZ39XPZ931GYzMGH9VPHYfAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADp8Q9+nG9anuOrfAAAAABJRU5ErkJggg=='}
                  alt={selectedUser.first_name}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
        
            {/* Name & Info */}
            <h2 className="text-2xl font-bold text-gray-800">
              <span onClick={() => router(`/profile/${selectedUser._id}`)} className="cursor-pointer text-blue-800 hover:text-blue-600">
                {selectedUser.first_name} {selectedUser.last_name}
              </span>, {selectedUser.age}
            </h2>
            <p className="text-sm font-medium text-pink-500 mb-2">{selectedUser.gender ? t(`account.profile.profile.gender.${selectedUser.gender.toLowerCase()}`) : '-'}</p>
        
            {/* Profession */}
            {selectedUser.profession && (
              <p className="text-sm text-gray-700">
                <strong>{t('account.profile.profile.form.profession.label')}:</strong> {selectedUser.profession}
              </p>
            )}
        
            {/* Smoking Status */}
            {selectedUser.smoking_status && (
              <p className="text-sm text-gray-700 mb-2">
                <strong>{t('account.profile.profile.form.smoking_status.label')}:</strong> {selectedUser.smoking_status ? t('account.profile.profile.smoking_status.yes') : t('account.profile.profile.smoking_status.no')}
              </p>
            )}
        
            {/* Description */}
            {selectedUser.description && (
              <p className="text-sm text-gray-600 px-4 mb-4 leading-relaxed">
                {selectedUser.description}
              </p>
            )}
        
            {/* Interests */}
            {selectedUser.interests?.length > 0 && (
              <div className="w-full px-4 mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('account.profile.profile.form.interests.label')}</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {selectedUser.interests.map((interest, i) => (
                    <span
                      key={i}
                      className="bg-pink-100 text-pink-600 text-xs px-3 py-1 rounded-full shadow-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
        
            {/* Looking For */}
            {selectedUser.looking_for && (
              <div className="w-full px-4 text-sm text-gray-600 mb-6">
                <p>
                  <strong className="text-gray-700">{t('account.profile.profile.form.looking_for.label')}:</strong>{' '}
                  {selectedUser.looking_for ? t(`account.profile.profile.gender.${selectedUser.looking_for}`) : '-'}
                </p>
              </div>
            )}
        
            {/* Block User Button */}
            { !selectedUser?.is_blocked && <button
              onClick={() => {
                blockUser(selectedUser.id);
              }}
              className="mt-2 px-4 py-2 rounded-full text-sm font-medium text-red-600 bg-red-100 hover:bg-red-200 transition-colors"
            >
              🚫 {t('inbox.block')}
            </button> }
          </div>
        </div>
      )}
    </Animate>
  );
}
