import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Combobox } from './component/combobox/combobox';
import { Country } from './services/country';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, Combobox],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {

  countries: string[] = [];
  selectedCountries: any[] = [];

  constructor(private country: Country) {}

  ngOnInit(): void {
    this.country.getAllCountryNames().subscribe({
      next: (names) => {
        this.countries = names;
      },
    });
  }

onCountrySelected(index: number, value: any): void {
  this.selectedCountries[index] = value;
}
}
