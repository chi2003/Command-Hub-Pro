using System;
using System.Collections.Generic;
using System.Windows;
using System.Windows.Controls;
using CmdManager.Models;

namespace CmdManager.Views
{
    public partial class ChainFormDialog : Window
    {
        public CommandChain? Result { get; private set; }
        private readonly CommandChain? _existing;
        private readonly List<(TextBox prefix, TextBox cmd)> _stepBoxes = new();

        public ChainFormDialog(CommandChain? existing)
        {
            InitializeComponent();
            _existing = existing;

            if (existing != null)
            {
                TitleLabel.Text = "Edit Command Chain";
                NameBox.Text = existing.Name;
                DescBox.Text = existing.Description;
                CategoryBox.Text = existing.Category;
                foreach (ComboBoxItem item in ShellBox.Items)
                    if (item.Content?.ToString() == existing.Shell) { ShellBox.SelectedItem = item; break; }
                foreach (var s in existing.Steps) AddStepRow(s.Prefix, s.CommandText);
            }
            else
            {
                TitleLabel.Text = "New Command Chain";
                ShellBox.SelectedIndex = 0;
                AddStepRow("", "");
            }
        }

        private void AddStepRow(string prefix, string cmd)
        {
            var num = _stepBoxes.Count + 1;
            var border = new Border
            {
                Background = System.Windows.Media.Brushes.Transparent,
                BorderBrush = (System.Windows.Media.Brush)FindResource("BorderBrush"),
                BorderThickness = new Thickness(1), CornerRadius = new CornerRadius(8),
                Padding = new Thickness(10, 8, 10, 8), Margin = new Thickness(0, 0, 0, 8)
            };
            var grid = new Grid();
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            grid.RowDefinitions.Add(new RowDefinition());
            grid.RowDefinitions.Add(new RowDefinition());

            var numLabel = new TextBlock
            {
                Text = num.ToString(), FontSize = 13, FontWeight = FontWeights.Bold,
                Foreground = (System.Windows.Media.Brush)FindResource("PrimaryBrush"),
                VerticalAlignment = VerticalAlignment.Center, Width = 24, Margin = new Thickness(0, 0, 8, 0)
            };
            Grid.SetColumn(numLabel, 0); Grid.SetRowSpan(numLabel, 2);
            grid.Children.Add(numLabel);

            var prefixBox = new TextBox { Style = (Style)FindResource("SearchBox"), Text = prefix, Margin = new Thickness(0, 0, 0, 4) };
            prefixBox.SetValue(Grid.ColumnProperty, 1); prefixBox.SetValue(Grid.RowProperty, 0);
            grid.Children.Add(prefixBox);

            var cmdBox = new TextBox
            {
                Style = (Style)FindResource("SearchBox"), Text = cmd,
                FontFamily = new System.Windows.Media.FontFamily("Consolas")
            };
            cmdBox.SetValue(Grid.ColumnProperty, 1); cmdBox.SetValue(Grid.RowProperty, 1);
            grid.Children.Add(cmdBox);

            var removeBtn = new Button
            {
                Content = "✕", Style = (Style)FindResource("GhostButton"),
                Padding = new Thickness(6), Margin = new Thickness(8, 0, 0, 0),
                VerticalAlignment = VerticalAlignment.Center
            };
            var capture = (border, (prefixBox, cmdBox));
            removeBtn.Click += (s, e) =>
            {
                var idx = _stepBoxes.IndexOf(capture.Item2);
                if (idx >= 0) _stepBoxes.RemoveAt(idx);
                StepsPanel.Children.Remove(border);
            };
            Grid.SetColumn(removeBtn, 2); Grid.SetRowSpan(removeBtn, 2);
            grid.Children.Add(removeBtn);

            border.Child = grid;
            StepsPanel.Children.Add(border);
            _stepBoxes.Add((prefixBox, cmdBox));
        }

        private void AddStep_Click(object sender, RoutedEventArgs e) => AddStepRow("", "");

        private void Save_Click(object sender, RoutedEventArgs e)
        {
            if (string.IsNullOrWhiteSpace(NameBox.Text))
            {
                MessageBox.Show("Name is required.", "Validation", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            var steps = new List<CommandChainStep>();
            foreach (var (prefix, cmd) in _stepBoxes)
                if (!string.IsNullOrWhiteSpace(cmd.Text))
                    steps.Add(new CommandChainStep { Id = Guid.NewGuid().ToString(), Prefix = prefix.Text.Trim(), CommandText = cmd.Text.Trim() });

            if (steps.Count == 0)
            {
                MessageBox.Show("Add at least one step.", "Validation", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            Result = new CommandChain
            {
                Id = _existing?.Id ?? Guid.NewGuid().ToString(),
                Name = NameBox.Text.Trim(),
                Description = DescBox.Text.Trim(),
                Category = string.IsNullOrWhiteSpace(CategoryBox.Text) ? "general" : CategoryBox.Text.Trim().ToLower(),
                Shell = (ShellBox.SelectedItem as ComboBoxItem)?.Content?.ToString() ?? "both",
                Steps = steps
            };
            DialogResult = true;
        }

        private void Cancel_Click(object sender, RoutedEventArgs e) => DialogResult = false;
    }
}
