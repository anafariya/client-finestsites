import React, { useEffect, useState } from 'react';

const FloatingModal = ({ isOpen, onClose, title, description, cancel, ok, okFn, info }) => {

  const [modal, setModal] = useState({
      title: title,
      description: description,
      info: info
  })

  useEffect(() => {
    setModal({
      title: title,
      description: description,
      info: info
    })
  }, [title, info, description])

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 w-full max-w-[560px] p-4 bg-white rounded-xl shadow-lg transform transition-transform duration-300 ease-[cubic-bezier(0.77,0,0.175,1)]
        ${isOpen ? "translate-x-0 pointer-events-auto" : "translate-x-[120%] pointer-events-none"}`}
    >
      <div className="flex flex-row gap-4">
        <div className='flex-1 flex items-center justify-center gap-4'>
          <div>
            <div
              className={`flex items-center justify-center p-2 flex-1 ${
                modal.info === "success"
                  ? "bg-[#ECFDF3]"
                  : modal.info === "cup" || modal.info === "send"
                  ? "bg-[#F9F5FF]"
                  : "bg-[#FEF3F2]"
              } rounded-full w-12 h-12`}
            >
              <div
                className={`flex items-center justify-center p-2 ${
                  modal.info === "success"
                    ? "bg-[#D1FADF]"
                    : modal.info === "cup" || modal.info === "send"
                    ? "bg-[#F4EBFF]"
                    : "bg-[#faceca]"
                } rounded-full`}
              >
                {modal.info === "error" ? (
                  <img src="/assets/icons/alert-circle.svg" />
                ) : modal.info === "success" ? (
                  <img src="/assets/icons/success.svg" />
                ) : modal.info === "cup" ? (
                  <img src="/assets/icons/cup.png" />
                ) : modal.info === "send" ? (
                  <img src="/assets/icons/send.png" />
                ) : (
                  <img src="/assets/icons/ico-update.svg" />
                )}
              </div>
            </div>
          </div>
          <h2 className="text-lg font-bold">{modal.title}</h2>
        </div>
        <div className="flex gap-2 flex-col">
          <div className="flex justify-between items-start">
            
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
              &times;
            </button>
          </div>
          <p className="text-slate-600 text-[13px]">{modal.description}</p>
          {!modal.info && (
            <div className="w-full flex flex-row justify-end gap-4">
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 text-black bg-white rounded-lg hover:bg-gray-100 border border-slate-300"
              >
                {cancel}
              </button>
              <button
                onClick={okFn}
                className="mt-4 px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                {ok}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

  );
};

export {FloatingModal};