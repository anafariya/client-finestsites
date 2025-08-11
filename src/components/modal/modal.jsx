/***
*
*   MODAL
*   Display an overlay modal anywhere in your application by calling
*   context.modal.show() with an object containing the following params
*
*   PARAMS
*   buttonText: submit button text (string, optional)
*   destructive: show a red button (boolean, optional)
*   form: a form object (object, optional)
*   method: HTTP request type (string, optional)
*   text: message to the user (string, optional)
*   title: title (string, required)
*   url: url to send the form to (string, optional)
*
**********/

import { useContext, useEffect, useState } from 'react';
import { ViewContext, Card, Form } from 'components/lib';
import { CSSTransition } from 'react-transition-group';
import './modal.scss';
import QRCode from "react-qr-code";
import ConfettiExplosion from 'react-confetti-explosion';

export function Modal(props){
  const [isExploding, setIsExploding] = useState(true);

  const context = useContext(ViewContext);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(props.url)
    setIsCopied(true)
  }

  useEffect(() => {
    if(props.isQR){
      setIsExploding(true)
    }
  }, [props.isQR])

  return (
   <CSSTransition in appear timeout={ 0 } classNames='modal'>
      <div className='modal'
        onClick={(e) => !props.unClosed && e.target === e.currentTarget && context.modal.hide(true)}>
          {
            props.isQR && isExploding && <ConfettiExplosion 
              force={0.8}
              duration={3000}
              particleCount={350}
              width={3000}
              zIndex={102}
              className='size-full'
            />
          }
        <div className={`modal-content ${props.isQR && '!max-w-[35em]'}`}>
          <Card title={ props.title } icon={props.confirm} isClosed={props.isQR || props.isClosed} closedFn={() => context.modal.hide(true)} qrTitle={props.qrTitle} type={props.type} subtitle={props.subtitle}>

            {
              props.uploadProgress && <div className="flex w-full justify-center items-center flex-col gap-4">
              <img src="/assets/icons/loading_circle.png" className="size-12 animate-spin duration-[2s]" alt='Spinner' style={{ animationDuration: '2s' }}  />
              <p className='font-medium text-lg mb-2 text-center'>{ props.progress?.title }</p>
              <p className='text-neutral-400 text-sm text-center'>{ props.progress?.note }</p>
            </div>    
            }

            {
              props.isQR && <div className="flex flex-col space-y-2 relative">
              
              <div className="flex justify-center flex-col gap-4 items-center bg-[#F9FAFB] p-6">
                <QRCode value={props.url} className='size-[114px]' id="QRCode"/>
                <button 
                  type={'button'}
                  className={ `cursor-pointer font-sans border-solid border border-slate-200 hover:!text-black bg- w-max inline-block mr-[2%] last:mr-0 relative text-center font-semibold px-12 py-3 ease-in-out duration-500 text-white uppercase rounded-[13px] hover:brightness-150 bg-emerald-500 hover:bg-emerald-600` }
                  onClick={() => {
                    const svg = document.getElementById("QRCode");
                    const svgData = new XMLSerializer().serializeToString(svg);
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    const img = new Image();
                    img.onload = () => {
                      canvas.width = img.width;
                      canvas.height = img.height;
                      ctx.drawImage(img, 0, 0);
                      const pngFile = canvas.toDataURL("image/png");
                      const downloadLink = document.createElement("a");
                      downloadLink.download = "QRCode";
                      downloadLink.href = `${pngFile}`;
                      downloadLink.click();
                    };
                    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
                  }}>
                  Download
                </button>
              </div>
              {/* URL Display Section */}
              <div className="flex flex-col gap-2">
                <span className="text-gray-600 text-left text-sm">Your website URL</span>
                  <div className="grid grid-cols-8 gap-2 w-full">
                    <label for="copy" className="sr-only">Label</label>
                    <input id="copy" type="text" className="col-span-7 border border-gray-300 text-gray-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500" value={props.url} disabled readonly/>
                    <button data-copy-to-clipboard-target="copy" className=" text-white focus:outline-none font-medium rounded-lg text-sm w-full sm:w-auto py-1 text-center items-center inline-flex justify-center" onClick={(e)=>handleCopy()}>
                      {
                        !isCopied ? 
                          <span id="default-message">
                            <img src="/assets/icons/copy.svg" className='size-4' />
                          </span>
                        : <span id="success-message">
                          <div className="flex items-center justify-center w-full">
                              <svg className="w-3 h-3 text-green-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5.917 5.724 10.5 15 1.5"/>
                              </svg>
                          </div>
                      </span>
                      }
                        
                    </button>
                </div>
              </div>
            </div>
            }

            { props.confirm && !props.isQR &&
                <p className='font-bold text-lg'>{ '' }</p> }

            { props.text &&
                <p>{ props.text }</p> }

            { props.form &&
              <Form
                method={ props.method }
                url={ props.url }
                inputs={ props.form }
                destructive={ props.destructive }
                buttonText={ props.buttonText }
                cancel={ e => context.modal.hide(true) }
                confirm={props.confirm}
                buttonClick={props.buttonClick}
                isQR={props.isQR}
              />
            }
          </Card>
        </div>
      </div>
    </CSSTransition>
  );
}
