import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { describe, beforeEach, it, expect, vi } from "vitest";
import { of, throwError } from "rxjs";
import { AdminUsersComponent } from "./admin-users.component";
import { UserService } from "../../../../services/user.service";
import { User } from "../../../../models/user.model";

const makeUser = (over: Partial<User> = {}): User => ({
  id: "u1",
  name: "Alice",
  email: "alice@example.com",
  isAdmin: false,
  isDeleted: false,
  ...over,
});

describe("AdminUsersComponent", () => {
  let userServiceMock: {
    getAllUsers: ReturnType<typeof vi.fn>;
    updateUser: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    userServiceMock = {
      getAllUsers: vi.fn().mockReturnValue(of([makeUser()])),
      updateUser: vi.fn().mockReturnValue(of(makeUser({ name: "Alice Updated" }))),
    };

    await TestBed.configureTestingModule({
      imports: [AdminUsersComponent],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: userServiceMock },
      ],
    }).compileComponents();
  });

  it("should create the component and load users", () => {
    const fixture = TestBed.createComponent(AdminUsersComponent);
    const cmp = fixture.componentInstance;

    expect(cmp).toBeTruthy();
    expect(userServiceMock.getAllUsers).toHaveBeenCalledTimes(1);
    expect(cmp.users().length).toBe(1);
    expect(cmp.users()[0].id).toBe("u1");
    expect(cmp.loading()).toBe(false);
    expect(cmp.error()).toBeNull();
  });

  it("should set error when loading users fails", () => {
    userServiceMock.getAllUsers.mockReturnValueOnce(throwError(() => new Error("load failed")));

    const fixture = TestBed.createComponent(AdminUsersComponent);
    const cmp = fixture.componentInstance;

    expect(cmp.error()).toBe("Failed to load users");
    expect(cmp.loading()).toBe(false);
    expect(cmp.users().length).toBe(0);
  });

  it("should edit a user and populate the form", () => {
    const fixture = TestBed.createComponent(AdminUsersComponent);
    const cmp = fixture.componentInstance;
    const user = makeUser({ id: "u2", name: "Bob", email: "bob@example.com", isAdmin: true, isDeleted: false });

    cmp.editUser(user);

    expect(cmp.selectedUser()?.id).toBe("u2");
    expect(cmp.form.value).toEqual({
      name: "Bob",
      email: "bob@example.com",
      isAdmin: true,
      isDeleted: false,
    });
    expect(cmp.error()).toBeNull();
  });

  it("should update a selected user when saveUser is called", () => {
    const fixture = TestBed.createComponent(AdminUsersComponent);
    const cmp = fixture.componentInstance;
    const user = makeUser({ id: "u1", name: "Alice", email: "alice@example.com", isAdmin: false });

    cmp.editUser(user);
    cmp.form.setValue({
      name: "Alice",
      email: "alice@example.com",
      isAdmin: true,
      isDeleted: false,
    });

    cmp.saveUser();

    expect(userServiceMock.updateUser).toHaveBeenCalledWith("u1", {
      name: "Alice",
      email: "alice@example.com",
      isAdmin: true,
      isDeleted: false,
    });
    expect(cmp.selectedUser()).toBeNull();
    expect(userServiceMock.getAllUsers).toHaveBeenCalledTimes(2);
  });
});