import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { describe, beforeEach, it, expect, vi } from "vitest";
import { of, throwError } from "rxjs";
import { AdminCategoriesComponent } from "./admin-categories.component";
import { CategoryService } from "../../../../services/category.service";
import { Category } from "../../../../models/category.model";

const makeCategory = (over: Partial<Category> = {}): Category => ({
  id: "cat1",
  name: "SUV",
  description: "Family cars",
  ...over,
});

describe("AdminCategoriesComponent", () => {
  let categoryServiceMock: {
    getCategories: ReturnType<typeof vi.fn>;
    createCategory: ReturnType<typeof vi.fn>;
    updateCategory: ReturnType<typeof vi.fn>;
    deleteCategory: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    categoryServiceMock = {
      getCategories: vi.fn().mockReturnValue(of([makeCategory()])),
      createCategory: vi.fn().mockReturnValue(of(makeCategory({ id: "cat2", name: "Compact" }))),
      updateCategory: vi.fn().mockReturnValue(of(makeCategory({ name: "SUV Updated" }))),
      deleteCategory: vi.fn().mockReturnValue(of({ message: "ok" })),
    };

    await TestBed.configureTestingModule({
      imports: [AdminCategoriesComponent],
      providers: [
        provideRouter([]),
        { provide: CategoryService, useValue: categoryServiceMock },
      ],
    }).compileComponents();
  });

  it("should create the component and load categories", () => {
    const fixture = TestBed.createComponent(AdminCategoriesComponent);
    const cmp = fixture.componentInstance;

    expect(cmp).toBeTruthy();
    expect(categoryServiceMock.getCategories).toHaveBeenCalledTimes(1);
    expect(cmp.categories().length).toBe(1);
    expect(cmp.categories()[0].id).toBe("cat1");
    expect(cmp.loading()).toBe(false);
    expect(cmp.error()).toBeNull();
  });

  it("should set error when loading categories fails", () => {
    categoryServiceMock.getCategories.mockReturnValueOnce(throwError(() => new Error("load failed")));

    const fixture = TestBed.createComponent(AdminCategoriesComponent);
    const cmp = fixture.componentInstance;

    expect(cmp.error()).toBe("Failed to load categories");
    expect(cmp.loading()).toBe(false);
    expect(cmp.categories().length).toBe(0);
  });

  it("should edit a category and populate the form", () => {
    const fixture = TestBed.createComponent(AdminCategoriesComponent);
    const cmp = fixture.componentInstance;
    const category = makeCategory({ id: "cat1", name: "Luxury", description: "Premium models" });

    cmp.edit(category);

    expect(cmp.selectedCategory()?.id).toBe("cat1");
    expect(cmp.form.value).toEqual({ name: "Luxury", description: "Premium models" });
    expect(cmp.error()).toBeNull();
  });

  it("should create a category when save is called without a selected category", () => {
    const fixture = TestBed.createComponent(AdminCategoriesComponent);
    const cmp = fixture.componentInstance;

    cmp.form.setValue({ name: "Compact", description: "Small and efficient" });
    cmp.save();

    expect(categoryServiceMock.createCategory).toHaveBeenCalledWith({
      name: "Compact",
      description: "Small and efficient",
    });
    expect(cmp.selectedCategory()).toBeNull();
    expect(categoryServiceMock.getCategories).toHaveBeenCalledTimes(2);
  });
});