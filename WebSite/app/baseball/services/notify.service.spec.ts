import { TestBed } from '@angular/core/testing';
import { NotifyService } from './notify.service';
import { MessageBoxService } from '../../shared/services';
import { ToastrService } from 'ngx-toastr';
import { ModalDialogMessage } from '../../shared/models';
import { Language } from '../../shared/language.native';

describe('NotifyService', () => {
  let service: NotifyService;
  let mockMessageBoxService: jest.SpyInstance;
  let mockToastrService: jest.SpyInstance;

  beforeEach(() => {
    const messageBoxSpy = {
      confirm: jest.fn(),
      closePopup: jest.fn()
    };
    const toastrSpy = {
      clear: jest.fn(),
      error: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        NotifyService,
        { provide: MessageBoxService, useValue: messageBoxSpy },
        { provide: ToastrService, useValue: toastrSpy }
      ]
    });

    service = TestBed.inject(NotifyService);
    mockMessageBoxService = messageBoxSpy.confirm;
    mockToastrService = toastrSpy.error;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('confirm', () => {
    it('should call messageBoxService.confirm with correct parameters', () => {
      const message = 'Test confirmation message';
      const confirmCallback = jest.fn();
      const rejectCallback = jest.fn();
      const hasActionOnNoBtn = true;

      service.confirm(message, confirmCallback, hasActionOnNoBtn, rejectCallback);

      expect(mockMessageBoxService).toHaveBeenCalledWith(
        expect.any(Object),
        confirmCallback,
        rejectCallback
      );
    });

    it('should set confirmation dialog message correctly', () => {
      const message = 'Test message';
      const confirmCallback = jest.fn();

      service.confirm(message, confirmCallback);

      expect(mockMessageBoxService).toHaveBeenCalledWith(
        expect.objectContaining({
          message: message,
          hasActionOnNoBtn: false
        }),
        confirmCallback,
        undefined
      );
    });

    it('should use default hasActionOnNoBtn when not provided', () => {
      const message = 'Test message';
      const confirmCallback = jest.fn();

      service.confirm(message, confirmCallback);

      expect(mockMessageBoxService).toHaveBeenCalledWith(
        expect.objectContaining({
          hasActionOnNoBtn: false
        }),
        confirmCallback,
        undefined
      );
    });
  });

  describe('clearError', () => {
    it('should call toastrService.clear', () => {
      service.clearError();

      expect(service['toastrService'].clear).toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('should call toastrService.error with correct message', () => {
      const errorMessage = 'Test error message';

      service.error(errorMessage);

      expect(service['toastrService'].error).toHaveBeenCalledWith(errorMessage);
    });
  });

  describe('closePopup', () => {
    it('should call messageBoxService.closePopup', () => {
      service.closePopup();

      expect(service['messageBoxService'].closePopup).toHaveBeenCalled();
    });
  });
}); 