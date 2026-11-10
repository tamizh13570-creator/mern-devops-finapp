import React, { useEffect, useRef } from 'react';

const TrendChart = ({ data = [], height = 240 }) => {
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
      ctx.fillText('No historical trends available', width / 2, h / 2);
      return;
    }

    const padding = { top: 30, right: 20, bottom: 40, left: 50 };
    const chartW = width - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // Find max value
    const maxVal = Math.max(
      ...data.map((d) => Math.max(d.income || 0, d.expense || 0)),
      1000
    );

    // Draw horizontal grid lines
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'right';
      const labelVal = Math.round(maxVal - (maxVal / 4) * i);
      ctx.fillText(`₹${(labelVal / 1000).toFixed(0)}k`, padding.left - 8, y + 3);
    }

    const barGroupWidth = chartW / data.length;
    const barWidth = Math.min(22, barGroupWidth * 0.32);

    data.forEach((item, idx) => {
      const groupX = padding.left + idx * barGroupWidth;
      const midX = groupX + barGroupWidth / 2;

      // Income Bar (Green)
      const incomeH = ((item.income || 0) / maxVal) * chartH;
      const incomeX = midX - barWidth - 3;
      const incomeY = padding.top + chartH - incomeH;

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.roundRect(incomeX, incomeY, barWidth, incomeH, [4, 4, 0, 0]);
      ctx.fill();

      // Expense Bar (Red)
      const expenseH = ((item.expense || 0) / maxVal) * chartH;
      const expenseX = midX + 3;
      const expenseY = padding.top + chartH - expenseH;

      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.roundRect(expenseX, expenseY, barWidth, expenseH, [4, 4, 0, 0]);
      ctx.fill();

      // Month label
      ctx.fillStyle = '#64748b';
      ctx.font = '11px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.month || item.monthYear, midX, h - 15);
    });
  }, [data]);

  return (
    <div>
      <div className="d-flex justify-content-end gap-3 mb-2 small">
        <div className="d-flex align-items-center gap-1">
          <span className="d-inline-block rounded" style={{ width: '12px', height: '12px', backgroundColor: '#10b981' }}></span>
          <span className="text-muted">Income</span>
        </div>
        <div className="d-flex align-items-center gap-1">
          <span className="d-inline-block rounded" style={{ width: '12px', height: '12px', backgroundColor: '#f43f5e' }}></span>
          <span className="text-muted">Expense</span>
        </div>
      </div>
      <canvas ref={canvasRef} width={480} height={height} style={{ width: '100%', height: `${height}px` }} />
    </div>
  );
};

export default TrendChart;
