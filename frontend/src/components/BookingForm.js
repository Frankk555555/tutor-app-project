import React, { useState, useMemo } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker'; // 1. Import DatePicker
import { setHours, setMinutes, parseISO, format } from 'date-fns'; // 2. Import ตัวช่วยจาก date-fns
import th from 'date-fns/locale/th';
import Swal from 'sweetalert2';


registerLocale('th', th);

const BookingForm = ({ tutor, onBook }) => {
    // 3. สร้าง State สำหรับเก็บวันที่ที่เลือกในปฏิทิน
    const [selectedDate, setSelectedDate] = useState(null);
    const [duration, setDuration] = useState(60);
    const [studentMessage, setStudentMessage] = useState('');
    // 4. (ส่วนสมอง) แปลงข้อมูล 'availability' ให้อยู่ในรูปแบบที่ใช้งานง่าย และจำค่าไว้ด้วย useMemo
    const availableDates = useMemo(() => {
        // สร้าง Set ของวันที่ว่างในรูปแบบ 'YYYY-MM-DD' เพื่อให้ค้นหาได้เร็ว
        const dateSet = new Set();
        tutor.availability.forEach(slot => {
            dateSet.add(format(parseISO(slot.available_date), 'yyyy-MM-dd'));
        });
        return dateSet;
    }, [tutor.availability]);

    // 5. ฟังก์ชันสำหรับสร้าง "ช่วงเวลาที่เลือกได้" สำหรับวันที่ที่ถูกเลือก
    const generateIncludeTimes = (date) => {
        if (!date) return []; // ถ้ายังไม่ได้เลือกวัน ให้คืนค่าว่าง

        const dateString = format(date, 'yyyy-MM-dd');

        // ค้นหาทุกช่วงเวลาที่ตรงกับวันที่เลือก
        const slotsForDay = tutor.availability.filter(slot => 
            format(parseISO(slot.available_date), 'yyyy-MM-dd') === dateString
        );

        if (slotsForDay.length === 0) return []; // ถ้าวันนั้นไม่มี slot ว่าง

        // สร้าง Array ของเวลาที่เป็น Date object
        let times = [];
        slotsForDay.forEach(slot => {
            const startHour = parseInt(slot.start_time.split(':')[0]);
            const endHour = parseInt(slot.end_time.split(':')[0]);

            for (let hour = startHour; hour < endHour; hour++) {
                // สร้าง Date object สำหรับแต่ละชั่วโมงที่ว่าง
                times.push(setHours(setMinutes(date, 0), hour));
            }
        });
        return times;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedDate) {
            Swal.fire({
                title: 'ข้อมูลไม่ครบถ้วน',
                text: 'กรุณาเลือกวันและเวลาที่ต้องการนัดหมาย',
                icon: 'warning',
                confirmButtonColor: '#3085d6'
            });
            return;
        }
        // 6. ส่งข้อมูล `selectedDate` ที่เป็น Date object กลับไป
        onBook({ 
            appointmentTime: selectedDate, 
            duration: duration,
            studentMessage: studentMessage // สามารถเพิ่มช่องสำหรับข้อความได้ในอนาคต
        });
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            <div className="form-group">
                <label>เลือกวันและเวลาที่ติวเตอร์ว่าง</label>
                <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    showTimeSelect // เปิดโหมดเลือกเวลา
                    // filterDate: อนุญาตให้คลิกได้เฉพาะวันที่มีอยู่ใน availableDates
                    filterDate={(date) => availableDates.has(format(date, 'yyyy-MM-dd'))}
                    // includeTimes: แสดงเฉพาะช่วงเวลาที่ว่างของวันที่เลือก
                    includeTimes={generateIncludeTimes(selectedDate)}
                    locale="th"
                    dateFormat="d MMMM yyyy เวลา HH:mm น." // รูปแบบการแสดงผล
                    placeholderText="คลิกเพื่อเลือกวันและเวลา"
                    minDate={new Date()} // ไม่ให้เลือกวันในอดีต
                    className="date-picker-input" // เพิ่ม class สำหรับ styling
                    inline // ทำให้ปฏิทินแสดงผลตลอดเวลา
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="duration">เลือกจำนวนชั่วโมง</label>
                <select 
                    id="duration"
                    value={duration} 
                    onChange={(e) => setDuration(Number(e.target.value))}
                >
                    <option value={60}>1 ชั่วโมง</option>
                    <option value={120}>2 ชั่วโมง</option>
                    <option value={180}>3 ชั่วโมง</option>
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="studentMessage">ข้อความถึงติวเตอร์ (ถ้ามี)</label>
                <textarea
                    id="studentMessage"
                    value={studentMessage}
                    onChange={(e) => setStudentMessage(e.target.value)}
                    placeholder="เช่น อยากเน้นเรื่อง..."
                ></textarea>
            </div>

            <button type="submit" className="btn" style={{ width: '100%', marginTop: '20px' }}>
                ยืนยันการนัดหมาย
            </button>
        </form>
    );
};

export default BookingForm;