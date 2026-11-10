import React, { useEffect, useRef } from 'react';

const PieChart = ({ data = [], height = 240 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, width, h);

    if (!data || data.length === 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No expense data available for this month', width / 2, h / 2);
      return;
    }

    const total = data.reduce((acc, item) => acc + (item.amount || item.total || 0), 0);
    if (total === 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No expenses logged', width / 2, h / 2);
      return;
    }

    const centerX = width / 2;
    const centerY = h / 2;
    const radius = Math.min(centerX, centerY) - 15;
    const innerRadius = radius * 0.55; // Donut style

    let startAngle = -0.5 * Math.PI;

    data.forEach((slice) => {
      const sliceVal = slice.amount || slice.total || 0;
      const sliceAngle = (sliceVal / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = slice.color || '#4f46e5';
      ctx.fill();

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      startAngle = endAngle;
    });

    // Center text
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 16px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${data.length} Categories`, centerX, centerY);
  }, [data]);

  return (
    <div className="d-flex flex-column align-items-center">
      <canvas ref={canvasRef} width={280} height={height} />
      <div className="d-flex flex-wrap gap-2 justify-content-center mt-3" style={{ maxHeight: '90px', overflowY: 'auto' }}>
        {data.slice(0, 6).map((item, idx) => (
          <div key={idx} className="badge bg-light text-dark border d-flex align-items-center gap-1 p-2">
            <span
              className="d-inline-block rounded-circle"
              style={{ width: '10px', height: '10px', backgroundColor: item.color || '#4f46e5' }}
            ></span>
            <span>{item.name || item.icon}</span>
            <strong className="ms-1">₹{item.amount?.toLocaleString('en-IN') || item.totalInRupees || 0}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart;
