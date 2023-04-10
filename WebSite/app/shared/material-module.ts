import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatDialogModule } from '@angular/material/dialog';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  exports: [
    MatCheckboxModule,
    MatExpansionModule,
    MatInputModule,
    MatRippleModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDialogModule,
    DragDropModule,
    ScrollingModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatButtonModule
  ]
})
export class MaterialModule {}
