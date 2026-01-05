import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ImportStats } from '../types';

interface ImportResultsProps {
  stats: ImportStats;
}

export function ImportResults({ stats }: ImportResultsProps) {
  const [expandedSection, setExpandedSection] = useState<'transactions' | 'lotteries' | 'skipped' | null>(null);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="px-1">
        <h2 className="text-[13px] font-semibold text-[#1d1d1f]">Үр дүн</h2>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* Transactions */}
        <button
          onClick={() => setExpandedSection(expandedSection === 'transactions' ? null : 'transactions')}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 shadow-sm hover:shadow-md transition-all text-left active:scale-[0.98]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 rounded-full bg-[#34c759]/10 flex items-center justify-center">
              <span className="text-[14px]">💳</span>
            </div>
            {expandedSection === 'transactions' ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#34c759]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#86868b]" />
            )}
          </div>
          <p className="text-[10px] text-[#86868b] mb-1">Гүйлгээ</p>
          <p className="text-[20px] font-bold text-[#1d1d1f] tabular-nums">{stats.totalTransactions}</p>
        </button>

        {/* Lotteries */}
        <button
          onClick={() => setExpandedSection(expandedSection === 'lotteries' ? null : 'lotteries')}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 shadow-sm hover:shadow-md transition-all text-left active:scale-[0.98]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 rounded-full bg-[#007aff]/10 flex items-center justify-center">
              <span className="text-[14px]">🎫</span>
            </div>
            {expandedSection === 'lotteries' ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#007aff]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#86868b]" />
            )}
          </div>
          <p className="text-[10px] text-[#86868b] mb-1">Сугалаа</p>
          <p className="text-[20px] font-bold text-[#1d1d1f] tabular-nums">{stats.totalLotteries}</p>
        </button>

        {/* Skipped */}
        <button
          onClick={() => setExpandedSection(expandedSection === 'skipped' ? null : 'skipped')}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 shadow-sm hover:shadow-md transition-all text-left active:scale-[0.98]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 rounded-full bg-[#ff3b30]/10 flex items-center justify-center">
              <span className="text-[14px]">⚠️</span>
            </div>
            {expandedSection === 'skipped' ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#ff3b30]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#86868b]" />
            )}
          </div>
          <p className="text-[10px] text-[#86868b] mb-1">Алдаатай гүйлгээ</p>
          <p className="text-[20px] font-bold text-[#1d1d1f] tabular-nums">{stats.skippedTransactions}</p>
        </button>
      </div>

      {/* Transaction Details */}
      {expandedSection === 'transactions' && (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-black/5">
            <h3 className="text-[15px] font-semibold text-[#1d1d1f]">Гүйлгээний дэлгэрэнгүй</h3>
            <span className="text-[11px] text-[#86868b]">{stats.totalTransactions} гүйлгээ</span>
          </div>
          {stats.transactions && stats.transactions.length > 0 ? (
            <div className="space-y-2  overflow-y-auto">
              {stats.transactions.map((tx: any, i: number) => (
                <div key={i} className="bg-[#f5f5f7] rounded-2xl p-3 hover:bg-[#e5e5ea] transition-all active:scale-[0.98]">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-[15px] font-semibold text-[#34c759] tabular-nums">{tx.credit?.toLocaleString()}₮</p>
                      <p className="text-[11px] text-[#86868b] mt-0.5">{new Date(tx.guildgeeniiOgnoo).toLocaleDateString('mn-MN')}</p>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${
                      tx.islottery
                        ? 'bg-[#34c759]/10 text-[#34c759]'
                        : 'bg-[#ff3b30]/10 text-[#ff3b30]'
                    }`}>
                      {tx.islottery ? '✓ Сугалаа' : '✗'}
                    </div>
                  </div>
                  {tx.guildgeeniiUtga && (
                    <p className="text-[11px] text-[#86868b] line-clamp-1">{tx.guildgeeniiUtga}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#86868b] text-center py-8 text-[12px]">Мэдээлэл байхгүй</p>
          )}
        </div>
      )}

      {/* Lottery Details */}
      {expandedSection === 'lotteries' && (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-black/5">
            <h3 className="text-[15px] font-semibold text-[#1d1d1f]">Сугалааны дэлгэрэнгүй</h3>
            <span className="text-[11px] text-[#86868b]">{stats.totalLotteries} сугалаа</span>
          </div>

          {stats.lotteries && stats.lotteries.length > 0 ? (
            <div className="space-y-2  overflow-y-auto">
              {(() => {
                const phoneGroups = stats.lotteries.reduce((acc: any, lottery: any) => {
                  const phone = lottery.phoneNumber || 'Тодорхойгүй';
                  if (!acc[phone]) acc[phone] = [];
                  acc[phone].push(lottery);
                  return acc;
                }, {});

                return Object.entries(phoneGroups).map(([phone, lotteries]: [string, any]) => (
                  <div key={phone} className="bg-[#f5f5f7] rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setSelectedPhone(selectedPhone === phone ? null : phone)}
                      className="w-full p-3 hover:bg-[#e5e5ea] transition-all text-left active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#007aff]/10 flex items-center justify-center">
                            <span className="text-[16px]">📱</span>
                          </div>
                          <span className="text-[13px] font-semibold text-[#1d1d1f]">{phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-[17px] font-bold text-[#1d1d1f] tabular-nums">{lotteries.length}</p>
                            <p className="text-[10px] text-[#86868b]">сугалаа</p>
                          </div>
                          {selectedPhone === phone ? (
                            <ChevronUp className="w-4 h-4 text-[#86868b]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#86868b]" />
                          )}
                        </div>
                      </div>
                    </button>

                    {selectedPhone === phone && (
                      <div className="px-3 pb-3 space-y-2">
                        {lotteries.map((lottery: any, i: number) => (
                          <div key={i} className="bg-white rounded-xl p-2.5">
                            <div className="flex items-center justify-between">
                              <p className="text-[12px] font-mono font-semibold text-[#007aff]">{lottery.lotteryNumber}</p>
                              <p className="text-[12px] font-semibold text-[#34c759] tabular-nums">{lottery.transactionAmount?.toLocaleString()}₮</p>
                            </div>
                            <p className="text-[10px] text-[#86868b] mt-1">{new Date(lottery.createdAt).toLocaleDateString('mn-MN')}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ));
              })()}
            </div>
          ) : (
            <p className="text-[#86868b] text-center py-8 text-[12px]">Мэдээлэл байхгүй</p>
          )}
        </div>
      )}

      {/* Skipped Details */}
      {expandedSection === 'skipped' && (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-black/5">
            <h3 className="text-[15px] font-semibold text-[#1d1d1f]">Алгасагдсан гүйлгээ</h3>
            <span className="text-[11px] text-[#86868b]">{stats.skippedTransactions} гүйлгээ</span>
          </div>
          {stats.skippedDetails && stats.skippedDetails.length > 0 ? (
            <div className="space-y-2  overflow-y-auto">
              {stats.skippedDetails.map((item: any, i: number) => (
                <div key={i} className="bg-[#f5f5f7] rounded-2xl p-3 hover:bg-[#e5e5ea] transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[15px] font-semibold text-[#ff3b30] tabular-nums">{item.credit?.toLocaleString()}₮  <span className='text-[#86818b]' >{item.guildgeeniiUtga}</span></p>
                    <div className="flex items-center gap-2">
                    <p className="text-[11px] text-[#86868b]">
                          {new Date(item.guildgeeniiOgnoo).toLocaleString('mn-MN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>

                

                    </div>
                  </div>
                  {/* <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-[#ff3b30]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[11px]">⚠️</span>
                    </div>
                    <p className="text-[12px] text-[#86868b]">{item.skipReason || 'Тодорхойгүй'}</p>
                  </div> */}
                </div>
              ))}
            </div>
          ) : stats.reasons && stats.reasons.length > 0 ? (
            <div className="bg-[#f5f5f7] rounded-2xl p-3">
              <ul className="space-y-1.5">
                {stats.reasons.map((reason, i) => (
                  <li key={i} className="text-[12px] text-[#86868b] flex items-center gap-2">
                    <span className="text-[#ff3b30]">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-[#86868b] text-center py-8 text-[12px]">Мэдээлэл байхгүй</p>
          )}
        </div>
      )}
    </div>
  );
}
