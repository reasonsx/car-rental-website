import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { describe, beforeEach, it, expect, vi } from "vitest";
import { of, throwError } from "rxjs";
import { AdminCarsComponent } from "./admin-cars.component";
import { CarService } from "../../../../services/car.service";
import { CategoryService } from "../../../../services/category.service";
import { LocationService } from "../../../../services/location.service";
import { Car, Category, Location } from "../../../../models/car.model";

const makeCategory = (over: Partial<Category> = {}): Category => ({
  _id: "cat1",
  name: "Sedan",
  description: "Test category",
  ...over,
});

const makeLocation = (over: Partial<Location> = {}): Location => ({
  _id: "loc1",
  name: "Warsaw",
  city: "Warsaw",
  address: "Main St 1",
  phone: "123456789",
  ...over,
});

const makeCar = (over: Partial<Car> = {}): Car => ({
  id: "c1",
  brand: "Toyota",
  modelName: "Corolla",
  year: 2022,
  pricePerDay: 80,
  available: true,
  imageUrl: "http://example.com/car.jpg",
  categoryId: makeCategory(),
  locationId: makeLocation(),
  ...over,
});

describe("AdminCarsComponent", () => {
  let carServiceMock: {
    getCars: ReturnType<typeof vi.fn>;
    createCar: ReturnType<typeof vi.fn>;
    updateCar: ReturnType<typeof vi.fn>;
    deleteCar: ReturnType<typeof vi.fn>;
  };

  let categoryServiceMock: { getCategories: ReturnType<typeof vi.fn> };
  let locationServiceMock: { getLocations: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    carServiceMock = {
      getCars: vi.fn().mockReturnValue(of([makeCar()])),
      createCar: vi.fn().mockReturnValue(of(makeCar({ id: "c2", brand: "Honda" }))),
      updateCar: vi.fn().mockReturnValue(of(makeCar({ brand: "Honda" }))),
      deleteCar: vi.fn().mockReturnValue(of({ message: "ok" })),
    };

    categoryServiceMock = {
      getCategories: vi.fn().mockReturnValue(of([makeCategory()])),
    };

    locationServiceMock = {
      getLocations: vi.fn().mockReturnValue(of([makeLocation()])),
    };

    await TestBed.configureTestingModule({
      imports: [AdminCarsComponent],
      providers: [
        provideRouter([]),
        { provide: CarService, useValue: carServiceMock },
        { provide: CategoryService, useValue: categoryServiceMock },
        { provide: LocationService, useValue: locationServiceMock },
      ],
    }).compileComponents();
  });

  it("should create the component", () => {
    const fixture = TestBed.createComponent(AdminCarsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should load cars, categories and locations on construction", () => {
    const fixture = TestBed.createComponent(AdminCarsComponent);
    const cmp = fixture.componentInstance;

    expect(carServiceMock.getCars).toHaveBeenCalledTimes(1);
    expect(categoryServiceMock.getCategories).toHaveBeenCalledTimes(1);
    expect(locationServiceMock.getLocations).toHaveBeenCalledTimes(1);
    expect(cmp.cars().length).toBe(1);
    expect(cmp.cars()[0].id).toBe("c1");
    expect(cmp.loading()).toBe(false);
    expect(cmp.error()).toBeNull();
  });

  it("should set error when loading cars fails", () => {
    carServiceMock.getCars.mockReturnValueOnce(throwError(() => new Error("fail")));

    const fixture = TestBed.createComponent(AdminCarsComponent);
    const cmp = fixture.componentInstance;

    expect(cmp.error()).toBe("Failed to load cars");
    expect(cmp.loading()).toBe(false);
    expect(cmp.cars().length).toBe(0);
  });

  it("should edit a car and populate the form", () => {
    const fixture = TestBed.createComponent(AdminCarsComponent);
    const cmp = fixture.componentInstance;
    const car = makeCar({
      id: "c1",
      brand: "Ford",
      modelName: "Fiesta",
      year: 2020,
      pricePerDay: 50,
      available: false,
      imageUrl: "http://example.com/fiesta.jpg",
    });

    cmp.editCar(car);

    expect(cmp.selectedCar()?.id).toBe("c1");
    expect(cmp.form.value).toEqual({
      brand: "Ford",
      modelName: "Fiesta",
      year: 2020,
      pricePerDay: 50,
      available: false,
      imageUrl: "http://example.com/fiesta.jpg",
      categoryId: "cat1",
      locationId: "loc1",
    });
    expect(cmp.error()).toBeNull();
  });

  it("should create a car when form is valid and no car is selected", () => {
    const fixture = TestBed.createComponent(AdminCarsComponent);
    const cmp = fixture.componentInstance;

    cmp.form.setValue({
      brand: "Honda",
      modelName: "Civic",
      year: 2023,
      pricePerDay: 90,
      available: true,
      imageUrl: "",
      categoryId: "cat1",
      locationId: "loc1",
    });

    cmp.saveCar();

    expect(carServiceMock.createCar).toHaveBeenCalledWith({
      brand: "Honda",
      modelName: "Civic",
      year: 2023,
      pricePerDay: 90,
      available: true,
      imageUrl: "",
      categoryId: "cat1",
      locationId: "loc1",
    });

    expect(cmp.success()).toBe("Car created successfully");
    expect(cmp.selectedCar()).toBeNull();
    expect(carServiceMock.getCars).toHaveBeenCalledTimes(2);
  });

  it("should update a selected car when saveCar is called", () => {
    const fixture = TestBed.createComponent(AdminCarsComponent);
    const cmp = fixture.componentInstance;
    const car = makeCar({ id: "c1" });

    cmp.editCar(car);

    cmp.form.setValue({
      brand: "Toyota",
      modelName: "Corolla",
      year: 2022,
      pricePerDay: 85,
      available: true,
      imageUrl: "http://example.com/car.jpg",
      categoryId: "cat1",
      locationId: "loc1",
    });

    cmp.saveCar();

    expect(carServiceMock.updateCar).toHaveBeenCalledWith("c1", {
      brand: "Toyota",
      modelName: "Corolla",
      year: 2022,
      pricePerDay: 85,
      available: true,
      imageUrl: "http://example.com/car.jpg",
      categoryId: "cat1",
      locationId: "loc1",
    });

    expect(cmp.success()).toBe("Car updated successfully");
    expect(cmp.selectedCar()).toBeNull();
    expect(carServiceMock.getCars).toHaveBeenCalledTimes(2);
  });

  it("should delete a car after confirmation and reload the list", () => {
    const fixture = TestBed.createComponent(AdminCarsComponent);
    const cmp = fixture.componentInstance;
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    carServiceMock.getCars.mockClear();
    cmp.deleteCar("c1");

    expect(confirmSpy).toHaveBeenCalled();
    expect(carServiceMock.deleteCar).toHaveBeenCalledWith("c1");
    expect(carServiceMock.getCars).toHaveBeenCalledTimes(1);

    confirmSpy.mockRestore();
  });

  it("should not delete when user cancels confirmation", () => {
    const fixture = TestBed.createComponent(AdminCarsComponent);
    const cmp = fixture.componentInstance;
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

    cmp.deleteCar("c1");

    expect(carServiceMock.deleteCar).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });
});
