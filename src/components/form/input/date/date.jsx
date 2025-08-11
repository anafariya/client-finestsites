/***
*
*   DATE PICKER
*   Date picker input
*
*   DOCS
*   https://docs.usegravity.app/gravity-web/components/form
*   https://ui.shadcn.com/docs/components/date-picker
*
*   PROPS
*   aria-describedby: id of the element that describes the input in ...props (string, optional)
*   aria-invalid: determines if the input is invalid in ...props (boolean, required)
*   className: custom styling (SCSS or tailwind style, optional)
*   defaultValue: initial value (string, optional)
*   placeholder: placeholder value (string, optional)
*   onChange: callback (function, required)
*   
**********/

import { forwardRef, useState, useEffect } from 'react';
import { format } from 'date-fns'
import { Calendar, Button, Popover, PopoverContent, PopoverTrigger, cn, useTranslation } from 'components/lib';

const DateInput = forwardRef(({ className, defaultValue, placeholder, onChange, isEvent, ...props }, ref) => {

  const [date, setDate] = useState(defaultValue ? new Date(defaultValue) : null);
  const { t } = useTranslation();

  useEffect(() =>{
    const init = (v) => {
      setDate(v)
    }
    const timer = setTimeout(() => {
      init(defaultValue)
    }, 10);

    ()  => clearTimeout(timer)
  }, [defaultValue])

  return (
    <Popover modal={true}>
      <PopoverTrigger asChild>
    
        <Button
          disabled={props.disabled}
          text={ date ? format(date, 'PPP') : (placeholder || t('global.form.date.placeholder')) }
          icon='calendar'
          variant='outline'
          className={ cn('w-full justify-start text-left font-normal bg-white', !date && 'text-muted-foreground') }/>

      </PopoverTrigger>

      <PopoverContent className='w-auto p-0 z-[999999] overflow-hidden'>
        <Calendar
          initialFocus
          mode='single'
          selected={ (date && (typeof date === "string" && date?.includes(':'))) ? () => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // months are zero-indexed
            const day = String(date.getDate()).padStart(2, '0');
        
            // format the date as 'YYYY-MM-DD' without timezones
            return `${year}-${month}-${day}`;
          }: date }
          className="rounded-lg border shadow-sm bg-white"
          onSelect={ value => {

            // create pure date
            const year = value.getFullYear();
            const month = String(value.getMonth() + 1).padStart(2, '0'); // months are zero-indexed
            const day = String(value.getDate()).padStart(2, '0');
        
            // format the date as 'YYYY-MM-DD' without timezones
            const selectedDate = `${year}-${month}-${day}`;
        
            setDate(value); // update state with the selected date object
            onChange(isEvent ? ({value: selectedDate}) : { target: { name: props.name, value: selectedDate }, type: 'change' }); 

          }}
        />
      </PopoverContent>
    </Popover>
  )
})

DateInput.displayName = 'DateInput'
export { DateInput }
