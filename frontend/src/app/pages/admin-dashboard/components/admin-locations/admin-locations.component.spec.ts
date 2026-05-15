import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { describe, beforeEach, it, expect, vi } from "vitest";
import { of, throwError } from "rxjs";
import { AdminLocationsComponent } from "./admin-locations.component";
import { LocationService } from "../../../../services/location.service";
import { Location } from "../../../../models/location.model";

const makeLocation = (over: Partial<Location> = {}): Location => ({
  _id: "loc1",
  name: "Warsaw Central",
  city: "Warsaw",
  address: "Main St 1",
  phone: "123456789",
  ...over,
});

describe("AdminLocationsComponent", () => {
  let locationServiceMock: {
    getLocations: ReturnType<typeof vi.fn>;
    createLocation: ReturnType<typeof vi.fn>;
    updateLocation: ReturnType<typeof vi.fn>;
    deleteLocation: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    locationServiceMock = {
      getLocations: vi.fn().mockReturnValue(of([makeLocation()])),
      createLocation: vi.fn().mockReturnValue(of(makeLocation({ _id: "loc2", name: "Krakow" }))),
      updateLocation: vi.fn().mockReturnValue(of(makeLocation({ name: "Warsaw East" }))),
      deleteLocation: vi.fn().mockReturnValue(of({ message: "ok" })),
    };

    await TestBed.configureTestingModule({
      imports: [AdminLocationsComponent],
      providers: [
        provideRouter([]),
        { provide: LocationService, useValue: locationServiceMock },
      ],
    }).compileComponents();
  });

  it("should create the component and load locations", () => {
    const fixture = TestBed.createComponent(AdminLocationsComponent);
    const cmp = fixture.componentInstance;

    expect(cmp).toBeTruthy();
    expect(locationServiceMock.getLocations).toHaveBeenCalledTimes(1);
    expect(cmp.locations().length).toBe(1);
    expect(cmp.locations()[0]._id).toBe("loc1");
    expect(cmp.loading()).toBe(false);
    expect(cmp.error()).toBeNull();
  });

  it("should set error when loading locations fails", () => {
    locationServiceMock.getLocations.mockReturnValueOnce(throwError(() => new Error("load failed")));

    const fixture = TestBed.createComponent(AdminLocationsComponent);
    const cmp = fixture.componentInstance;

    expect(cmp.error()).toBe("Failed to load locations");
    expect(cmp.loading()).toBe(false);
    expect(cmp.locations().length).toBe(0);
  });

  it("should edit a location and populate the form", () => {
    const fixture = TestBed.createComponent(AdminLocationsComponent);
    const cmp = fixture.componentInstance;
    const location = makeLocation({ _id: "loc1", name: "City Hub", city: "Warsaw", address: "Center 5", phone: "987654321" });

    cmp.editLocation(location);

    expect(cmp.selectedLocation()?._id).toBe("loc1");
    expect(cmp.form.value).toEqual({
      name: "City Hub",
      city: "Warsaw",
      address: "Center 5",
      phone: "987654321",
    });
    expect(cmp.error()).toBeNull();
  });

  it("should create a location when saveLocation is called without selectedLocation", () => {
    const fixture = TestBed.createComponent(AdminLocationsComponent);
    const cmp = fixture.componentInstance;

    cmp.form.setValue({
      name: "Katowice Office",
      city: "Katowice",
      address: "Industrial 10",
      phone: "555123456",
    });

    cmp.saveLocation();

    expect(locationServiceMock.createLocation).toHaveBeenCalledWith({
      name: "Katowice Office",
      city: "Katowice",
      address: "Industrial 10",
      phone: "555123456",
    });
    expect(cmp.selectedLocation()).toBeNull();
    expect(locationServiceMock.getLocations).toHaveBeenCalledTimes(2);
  });
});