import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CarService } from "../../../../services/car.service";
import { CategoryService } from "../../../../services/category.service";
import { LocationService } from "../../../../services/location.service";
import { Car } from "../../../../models/car.model";
import { Category } from "../../../../models/category.model";
import { Location } from "../../../../models/location.model";
import { TableModule } from "primeng/table";
import { CheckboxModule } from "primeng/checkbox";
import { SelectModule } from "primeng/select";
import { InputTextModule } from "primeng/inputtext";
import { ButtonModule } from "primeng/button";

@Component({
  selector: "app-admin-cars",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    TableModule,
    CheckboxModule,
  ],
  templateUrl: "./admin-cars.component.html",
})
export class AdminCarsComponent {
  cars = signal<Car[]>([]);
  categories = signal<Category[]>([]);
  locations = signal<Location[]>([]);
  selectedCar = signal<Car | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private carService: CarService,
    private categoryService: CategoryService,
    private locationService: LocationService,
  ) {
    this.form = this.fb.group({
      brand: ["", Validators.required],
      modelName: ["", Validators.required],
      year: [new Date().getFullYear(), [Validators.required, Validators.min(1900)]],
      pricePerDay: [0, [Validators.required, Validators.min(1)]],
      available: [true],
      imageUrl: [""],
      categoryId: ["", Validators.required],
      locationId: ["", Validators.required],
    });

    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    this.categoryService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (err) => this.error.set(err.error?.message || "Failed to load categories"),
    });

    this.locationService.getLocations().subscribe({
      next: (locations) => this.locations.set(locations),
      error: (err) => this.error.set(err.error?.message || "Failed to load locations"),
    });

    this.carService.getCars().subscribe({
      next: (cars) => {
        this.cars.set(cars);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || "Failed to load cars");
        this.loading.set(false);
      },
    });
  }

  editCar(car: Car): void {
    this.selectedCar.set(car);

    this.form.setValue({
      brand: car.brand,
      modelName: car.modelName,
      year: car.year,
      pricePerDay: car.pricePerDay,
      available: car.available,
      imageUrl: car.imageUrl ?? "",
      categoryId: car.categoryId,
      locationId: car.locationId,
    });

    this.success.set(null);
    this.error.set(null);
  }

  saveCar(): void {
    if (this.form.invalid) return;

    const carData = this.form.value;

    const request = this.selectedCar()
      ? this.carService.updateCar(this.selectedCar()?.id ?? "", carData)
      : this.carService.createCar(carData);

    request.subscribe({
      next: (car) => {
        this.success.set(
          this.selectedCar() ? "Car updated successfully" : "Car created successfully",
        );
        this.selectedCar.set(null);
        this.form.reset({ available: true, year: new Date().getFullYear(), pricePerDay: 0 });
        this.loadData();
      },
      error: (err) => this.error.set(err.error?.message || "Failed to save car"),
    });
  }

  deleteCar(id: string): void {
    if (!confirm("Delete this car?")) return;

    this.carService.deleteCar(id).subscribe({
      next: () => {
        this.success.set("Car deleted successfully");
        this.loadData();
      },
      error: (err) => this.error.set(err.error?.message || "Failed to delete car"),
    });
  }

  categoryName(car: Car): string {
    const category = car.categoryId;
    if (!category) return "N/A";
    if (typeof category === "string") return category;
    return (category as any).name || (category as any)._id || "N/A";
  }

  locationName(car: Car): string {
    const location = car.locationId;
    if (!location) return "N/A";
    if (typeof location === "string") return location;
    return (location as any).name || (location as any)._id || "N/A";
  }

  cancelEdit(): void {
    this.selectedCar.set(null);
    this.form.reset({ available: true, year: new Date().getFullYear(), pricePerDay: 0 });
    this.error.set(null);
    this.success.set(null);
  }
}
