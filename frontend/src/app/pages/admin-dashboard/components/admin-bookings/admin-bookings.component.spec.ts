import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { describe, beforeEach, it, expect, vi } from "vitest";
import { of, throwError } from "rxjs";
import { AdminBookingsComponent } from "./admin-bookings.component";
import { BookingService } from "../../../../services/booking.service";
import { Booking } from "../../../../models/booking.model";

const makeBooking = (over: Partial<Booking> = {}): Booking => ({
  _id: "b1",
  userId: { _id: "u1", name: "Alice", email: "a@a.com" },
  carId: { _id: "c1", brand: "Ford", modelName: "Focus", pricePerDay: 100 },
  startDate: "2026-05-01",
  endDate: "2026-05-05",
  totalPrice: 400,
  status: "pending",
  userInfo: {
    firstName: "Alice",
    lastName: "Smith",
    email: "a@a.com",
    phone: "123",
    dateOfBirth: "1990-01-01",
    driversLicenseNumber: "L1",
    driversLicenseExpiry: "2030-01-01",
    address: { street: "s", city: "c", postalCode: "00-000", country: "PL" },
  },
  ...over,
});

describe("AdminBookingsComponent", () => {
  let bookingServiceMock: {
    getBookings: ReturnType<typeof vi.fn>;
    updateBooking: ReturnType<typeof vi.fn>;
    deleteBooking: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    bookingServiceMock = {
      getBookings: vi.fn().mockReturnValue(of([makeBooking()])),
      updateBooking: vi.fn().mockReturnValue(of(makeBooking({ status: "confirmed" }))),
      deleteBooking: vi.fn().mockReturnValue(of({ message: "ok" })),
    };

    await TestBed.configureTestingModule({
      imports: [AdminBookingsComponent],
      providers: [
        provideRouter([]),
        { provide: BookingService, useValue: bookingServiceMock },
      ],
    }).compileComponents();
  });

  it("should create the component", () => {
    const fixture = TestBed.createComponent(AdminBookingsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should load bookings on construction", () => {
    const fixture = TestBed.createComponent(AdminBookingsComponent);
    const cmp = fixture.componentInstance;

    expect(bookingServiceMock.getBookings).toHaveBeenCalledTimes(1);
    expect(cmp.bookings().length).toBe(1);
    expect(cmp.bookings()[0]._id).toBe("b1");
    expect(cmp.loading()).toBe(false);
    expect(cmp.error()).toBeNull();
  });

  it("should set error when loading fails", () => {
    bookingServiceMock.getBookings.mockReturnValueOnce(throwError(() => new Error("fail")));

    const fixture = TestBed.createComponent(AdminBookingsComponent);
    const cmp = fixture.componentInstance;

    expect(cmp.error()).toBe("Failed to load bookings");
    expect(cmp.loading()).toBe(false);
    expect(cmp.bookings().length).toBe(0);
  });

  it("should not call updateBooking when status is unchanged", () => {
    const fixture = TestBed.createComponent(AdminBookingsComponent);
    const cmp = fixture.componentInstance;
    const booking = cmp.bookings()[0];

    cmp.updateStatus(booking, booking.status);

    expect(bookingServiceMock.updateBooking).not.toHaveBeenCalled();
  });

  it("should update booking status when changed", () => {
    const fixture = TestBed.createComponent(AdminBookingsComponent);
    const cmp = fixture.componentInstance;
    const booking = cmp.bookings()[0];

    cmp.updateStatus(booking, "confirmed");

    expect(bookingServiceMock.updateBooking).toHaveBeenCalledWith("b1", { status: "confirmed" });
    expect(booking.status).toBe("confirmed");
  });

  it("should delete a booking after confirmation and reload list", () => {
    const fixture = TestBed.createComponent(AdminBookingsComponent);
    const cmp = fixture.componentInstance;

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    bookingServiceMock.getBookings.mockClear();

    cmp.delete("b1");

    expect(confirmSpy).toHaveBeenCalled();
    expect(bookingServiceMock.deleteBooking).toHaveBeenCalledWith("b1");
    expect(bookingServiceMock.getBookings).toHaveBeenCalledTimes(1);

    confirmSpy.mockRestore();
  });

  it("should not delete when user cancels confirmation", () => {
    const fixture = TestBed.createComponent(AdminBookingsComponent);
    const cmp = fixture.componentInstance;

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

    cmp.delete("b1");

    expect(bookingServiceMock.deleteBooking).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });
});

