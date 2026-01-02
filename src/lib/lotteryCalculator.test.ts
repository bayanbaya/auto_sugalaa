/**
 * Unit tests for lotteryCalculator
 * Run: npm test
 */

import { extractPhoneNumber, calculateTicketCount } from './lotteryCalculator';

describe('extractPhoneNumber', () => {
  test('should extract phone number with spaces', () => {
    expect(extractPhoneNumber('MM:99189602 95518283')).toBe('99189602');
  });

  test('should extract phone number from long text', () => {
    const text = 'MM:99189602 95518283  (ХААН БАНК КАКЕН НУРБЕК) ХААНААС: 520000 АРИУНТУУЛ ДАМБАСАНЖАА';
    expect(extractPhoneNumber(text)).toBe('99189602');
  });

  test('should extract phone with +976 prefix', () => {
    expect(extractPhoneNumber('+976 99189602')).toBe('99189602');
    expect(extractPhoneNumber('+97699189602')).toBe('99189602');
  });

  test('should extract phone with 0 prefix', () => {
    expect(extractPhoneNumber('0 99189602')).toBe('99189602');
    expect(extractPhoneNumber('099189602')).toBe('99189602');
  });

  test('should extract phone with spaces in digits', () => {
    expect(extractPhoneNumber('0 99 18 96 02')).toBe('99189602');
    expect(extractPhoneNumber('9 9 1 8 9 6 0 2')).toBe('99189602');
  });

  test('should return null for invalid text', () => {
    expect(extractPhoneNumber('ХААН БАНК')).toBeNull();
    expect(extractPhoneNumber('Гүйлгээ')).toBeNull();
    expect(extractPhoneNumber('12345')).toBeNull();
    expect(extractPhoneNumber('')).toBeNull();
  });

  test('should return null for phone starting with 0', () => {
    // Phone can't start with 0 after country code
    expect(extractPhoneNumber('01234567')).toBeNull();
  });

  test('should handle multiple phones (return first)', () => {
    expect(extractPhoneNumber('99189602 95518283')).toBe('99189602');
  });
});

describe('calculateTicketCount', () => {
  test('should calculate correct ticket count', () => {
    expect(calculateTicketCount(50000, 20000).ticketCount).toBe(2);
    expect(calculateTicketCount(100000, 20000).ticketCount).toBe(5);
    expect(calculateTicketCount(19600, 20000).ticketCount).toBe(1);
  });

  test('should return 0 for insufficient amount', () => {
    expect(calculateTicketCount(15000, 20000).ticketCount).toBe(0);
    expect(calculateTicketCount(10000, 20000).ticketCount).toBe(0);
  });

  test('should apply QPAY fee (0.98 multiplier)', () => {
    const result = calculateTicketCount(49000, 20000);
    expect(result.grossAmount).toBe(50000); // 49000 / 0.98 = 50000
    expect(result.ticketCount).toBe(2);
  });

  test('should cap at maximum 5000 tickets', () => {
    const result = calculateTicketCount(200000000, 20000);
    expect(result.ticketCount).toBe(5000);
  });
});
